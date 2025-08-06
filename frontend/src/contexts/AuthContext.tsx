import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/services/api'

interface User {
  id: string
  email: string
  name?: string
  role: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: { email: string; password: string; name?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      authApi.verifyToken()
        .then(() => {
          // Token is valid
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authApi.login(credentials)
      const { access_token, expires_in } = response.data
      
      // Get user info
      const userResponse = await authApi.getCurrentUser()
      const userData = userResponse.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      
      // Set token expiration
      setTimeout(() => {
        logout()
      }, expires_in * 1000)
      
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: { email: string; password: string; name?: string }) => {
    try {
      await authApi.register(userData)
      // Auto-login after registration
      await login({ email: userData.email, password: userData.password })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authApi.logout().catch(() => {
      // Ignore logout errors
    })
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}