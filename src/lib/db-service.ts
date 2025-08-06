import { db } from '@/lib/db';
import { AIAgent, Conversation, Analytics, ToolExecution, User } from '@prisma/client';

export interface DbAgent {
  id: string;
  name: string;
  type: 'white_collar' | 'specialist' | 'generalist';
  role: string;
  capabilities: string[];
  status: 'training' | 'ready' | 'deployed' | 'inactive';
  config: {
    model: string;
    temperature: number;
    max_tokens: number;
    tools: string[];
    memory_config: {
      short_term: boolean;
      long_term: boolean;
      context_window: number;
    };
  };
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    cost_efficiency: number;
    human_comparison: number;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbConversation {
  id: string;
  agentId: string;
  userId: string;
  messages: Array<{
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseService {
  // User operations
  async createUser(email: string, name?: string, role = 'user'): Promise<User> {
    return await db.user.create({
      data: {
        email,
        name,
        role
      }
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email }
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { id }
    });
  }

  // Agent operations
  async createAgent(agentData: Omit<DbAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIAgent> {
    return await db.aIAgent.create({
      data: {
        name: agentData.name,
        type: agentData.type,
        role: agentData.role,
        capabilities: JSON.stringify(agentData.capabilities),
        status: agentData.status,
        config: JSON.stringify(agentData.config),
        performance: JSON.stringify(agentData.performance),
        userId: agentData.userId
      }
    });
  }

  async getAgentsByUserId(userId: string): Promise<DbAgent[]> {
    const agents = await db.aIAgent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return agents.map(agent => this.mapDbAgentToAgent(agent));
  }

  async getAgentById(id: string): Promise<DbAgent | null> {
    const agent = await db.aIAgent.findUnique({
      where: { id }
    });

    return agent ? this.mapDbAgentToAgent(agent) : null;
  }

  async updateAgent(id: string, updates: Partial<DbAgent>): Promise<DbAgent | null> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type;
    if (updates.role) updateData.role = updates.role;
    if (updates.capabilities) updateData.capabilities = JSON.stringify(updates.capabilities);
    if (updates.status) updateData.status = updates.status;
    if (updates.config) updateData.config = JSON.stringify(updates.config);
    if (updates.performance) updateData.performance = JSON.stringify(updates.performance);

    const agent = await db.aIAgent.update({
      where: { id },
      data: updateData
    });

    return agent ? this.mapDbAgentToAgent(agent) : null;
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      await db.aIAgent.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  // Conversation operations
  async createConversation(
    agentId: string,
    userId: string,
    messages: DbConversation['messages'],
    title?: string
  ): Promise<Conversation> {
    return await db.conversation.create({
      data: {
        agentId,
        userId,
        messages: JSON.stringify(messages),
        title
      }
    });
  }

  async getConversationsByUserId(userId: string): Promise<DbConversation[]> {
    const conversations = await db.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return conversations.map(conv => this.mapDbConversationToConversation(conv));
  }

  async getConversationsByAgentId(agentId: string): Promise<DbConversation[]> {
    const conversations = await db.conversation.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });

    return conversations.map(conv => this.mapDbConversationToConversation(conv));
  }

  async updateConversation(id: string, messages: DbConversation['messages']): Promise<DbConversation | null> {
    const conversation = await db.conversation.update({
      where: { id },
      data: {
        messages: JSON.stringify(messages),
        updatedAt: new Date()
      }
    });

    return conversation ? this.mapDbConversationToConversation(conversation) : null;
  }

  // Analytics operations
  async createAnalytics(
    eventType: string,
    eventData: any,
    metrics: any,
    userId?: string,
    agentId?: string,
    processingTime?: number
  ): Promise<Analytics> {
    return await db.analytics.create({
      data: {
        eventType,
        eventData: JSON.stringify(eventData),
        metrics: JSON.stringify(metrics),
        userId,
        agentId,
        processingTime
      }
    });
  }

  async getAnalyticsByUserId(userId: string, limit = 100): Promise<Analytics[]> {
    return await db.analytics.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async getAnalyticsByAgentId(agentId: string, limit = 100): Promise<Analytics[]> {
    return await db.analytics.findMany({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async getAnalyticsByEventType(eventType: string, limit = 100): Promise<Analytics[]> {
    return await db.analytics.findMany({
      where: { eventType },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  // Tool execution operations
  async createToolExecution(
    toolName: string,
    parameters: any,
    result: any,
    success: boolean,
    processingTime: number,
    error?: string,
    agentId?: string,
    conversationId?: string
  ): Promise<ToolExecution> {
    return await db.toolExecution.create({
      data: {
        toolName,
        parameters: JSON.stringify(parameters),
        result: JSON.stringify(result),
        success,
        processingTime,
        error,
        agentId,
        conversationId
      }
    });
  }

  async getToolExecutionsByAgentId(agentId: string, limit = 100): Promise<ToolExecution[]> {
    return await db.toolExecution.findMany({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  // Session operations
  async createSession(userId: string, token: string, expiresAt: Date): Promise<any> {
    return await db.session.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  }

  async getSessionByToken(token: string): Promise<any> {
    return await db.session.findUnique({
      where: { token },
      include: { user: true }
    });
  }

  async deleteSession(token: string): Promise<boolean> {
    try {
      await db.session.delete({
        where: { token }
      });
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Utility methods
  private mapDbAgentToAgent(agent: AIAgent): DbAgent {
    return {
      id: agent.id,
      name: agent.name,
      type: agent.type as any,
      role: agent.role,
      capabilities: JSON.parse(agent.capabilities),
      status: agent.status as any,
      config: JSON.parse(agent.config),
      performance: JSON.parse(agent.performance),
      userId: agent.userId,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };
  }

  private mapDbConversationToConversation(conversation: Conversation): DbConversation {
    return {
      id: conversation.id,
      agentId: conversation.agentId,
      userId: conversation.userId,
      messages: JSON.parse(conversation.messages),
      title: conversation.title || undefined,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };
  }

  // Analytics aggregation methods
  async getAgentPerformanceSummary(agentId: string): Promise<any> {
    const analytics = await db.analytics.findMany({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    const toolExecutions = await db.toolExecution.findMany({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    return {
      totalInteractions: analytics.length,
      totalToolExecutions: toolExecutions.length,
      averageProcessingTime: this.calculateAverageProcessingTime(analytics),
      toolSuccessRate: this.calculateToolSuccessRate(toolExecutions),
      recentActivity: analytics.slice(0, 10)
    };
  }

  private calculateAverageProcessingTime(analytics: Analytics[]): number {
    const validTimes = analytics
      .map(a => a.processingTime)
      .filter(time => time !== null && time !== undefined) as number[];
    
    if (validTimes.length === 0) return 0;
    
    return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  }

  private calculateToolSuccessRate(toolExecutions: ToolExecution[]): number {
    if (toolExecutions.length === 0) return 0;
    
    const successful = toolExecutions.filter(te => te.success).length;
    return (successful / toolExecutions.length) * 100;
  }
}

// Singleton instance
export const dbService = new DatabaseService();