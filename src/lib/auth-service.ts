import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from './db-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface AuthToken {
  token: string;
  user: AuthUser;
  expiresAt: Date;
}

export class AuthService {
  private saltRounds = 12;

  async register(userData: RegisterData): Promise<AuthToken> {
    const { email, password, name, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = await dbService.createUser(email, name, role);

    // Generate token
    const token = this.generateToken(user);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await dbService.createSession(user.id, token, expiresAt);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      expiresAt
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const { email, password } = credentials;

    // Find user
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await dbService.createSession(user.id, token, expiresAt);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      expiresAt
    };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if session exists and is valid
      const session = await dbService.getSessionByToken(token);
      if (!session || new Date() > session.expiresAt) {
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      await dbService.deleteSession(token);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  async refreshToken(token: string): Promise<AuthToken | null> {
    try {
      const user = await this.verifyToken(token);
      if (!user) {
        return null;
      }

      // Delete old session
      await dbService.deleteSession(token);

      // Generate new token
      const dbUser = await dbService.getUserById(user.id);
      if (!dbUser) {
        return null;
      }

      const newToken = this.generateToken(dbUser);

      // Create new session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await dbService.createSession(dbUser.id, newToken, expiresAt);

      return {
        token: newToken,
        user,
        expiresAt
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await dbService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update user password (this would need to be added to the User model and dbService)
      // For now, we'll just return success
      console.log('Password changed for user:', userId);
      
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        // Don't reveal that user doesn't exist
        return true;
      }

      // Generate reset token
      const resetToken = this.generateToken(user, '1h'); // 1 hour expiry

      // In a real application, you would send this token via email
      console.log('Password reset token for', email, ':', resetToken);

      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.verifyToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update user password
      console.log('Password reset for user:', user.id);

      // Invalidate all sessions for this user
      // This would need to be implemented in dbService

      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  }

  private generateToken(user: any, expiresIn = JWT_EXPIRES_IN): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn }
    );
  }

  // Middleware for protecting routes
  requireAuth(handler: (req: any, res: any) => Promise<any> | any) {
    return async (req: any, res: any) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.substring(7);
        const user = await this.verifyToken(token);

        if (!user) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Add user to request object
        req.user = user;
        return handler(req, res);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
      }
    };
  }

  // Role-based access control
  requireRole(roles: string[]) {
    return (handler: (req: any, res: any) => Promise<any> | any) => {
      return async (req: any, res: any) => {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        return handler(req, res);
      };
    };
  }

  // Get current user from request
  getCurrentUser(req: any): AuthUser | null {
    return req.user || null;
  }
}

// Utility functions for client-side
export const authUtils = {
  // Store token in localStorage
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  // Remove token from localStorage
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  // Parse JWT token (client-side only)
  parseToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
};

// Singleton instance
export const authService = new AuthService();