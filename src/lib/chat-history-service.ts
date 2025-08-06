export interface ChatMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    confidence?: number;
    processingTime?: number;
    multiLLM?: boolean;
    collaborationMode?: string;
    emotion?: string;
    tone?: string;
    topic?: string;
    tags?: string[];
  };
}

export interface ChatSession {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
  tags?: string[];
}

export interface ChatHistoryFilter {
  agentId?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export class ChatHistoryService {
  private storage: Storage;

  constructor() {
    this.storage = localStorage; // In production, this would be a database
  }

  // Chat Session Management
  async createSession(agentId: string, userId: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: this.generateId(),
      agentId,
      userId,
      title: title || `Chat with ${agentId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      tags: []
    };

    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);

    return session;
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.saveSessions(sessions);
    return sessions[sessionIndex];
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  async getSessionsByAgent(agentId: string, userId?: string): Promise<ChatSession[]> {
    const sessions = this.getSessions();
    return sessions
      .filter(s => s.agentId === agentId && (!userId || s.userId === userId))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getSessionsByUser(userId: string): Promise<ChatSession[]> {
    const sessions = this.getSessions();
    return sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    
    if (filteredSessions.length === sessions.length) return false;

    this.saveSessions(filteredSessions);
    
    // Also delete all messages for this session
    const allMessages = this.getMessages();
    const filteredMessages = allMessages.filter(m => m.sessionId !== sessionId);
    this.saveMessages(filteredMessages);

    return true;
  }

  // Message Management
  async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage> {
    const fullMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
      sessionId
    };

    const messages = this.getMessages();
    messages.push(fullMessage);
    this.saveMessages(messages);

    // Update session
    await this.updateSession(sessionId, {
      messageCount: messages.filter(m => m.sessionId === sessionId).length,
      lastMessage: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      updatedAt: new Date()
    });

    return fullMessage;
  }

  async getMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    const messages = this.getMessages();
    return messages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMessagesByAgent(agentId: string, limit?: number): Promise<ChatMessage[]> {
    const messages = this.getMessages();
    const agentMessages = messages
      .filter(m => m.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? agentMessages.slice(0, limit) : agentMessages;
  }

  async searchMessages(filter: ChatHistoryFilter): Promise<ChatMessage[]> {
    const messages = this.getMessages();
    let filteredMessages = messages;

    // Apply filters
    if (filter.agentId) {
      filteredMessages = filteredMessages.filter(m => m.agentId === filter.agentId);
    }

    if (filter.userId) {
      // Need to get session IDs for this user first
      const userSessions = this.getSessions().filter(s => s.userId === filter.userId);
      const sessionIds = userSessions.map(s => s.id);
      filteredMessages = filteredMessages.filter(m => m.sessionId && sessionIds.includes(m.sessionId));
    }

    if (filter.dateRange) {
      filteredMessages = filteredMessages.filter(m => 
        m.timestamp >= filter.dateRange!.start && 
        m.timestamp <= filter.dateRange!.end
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredMessages = filteredMessages.filter(m => 
        m.metadata?.tags?.some(tag => filter.tags!.includes(tag))
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredMessages = filteredMessages.filter(m => 
        m.content.toLowerCase().includes(query) ||
        m.metadata?.topic?.toLowerCase().includes(query) ||
        m.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (filter.offset) {
      filteredMessages = filteredMessages.slice(filter.offset);
    }
    if (filter.limit) {
      filteredMessages = filteredMessages.slice(0, filter.limit);
    }

    return filteredMessages;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const messages = this.getMessages();
    const filteredMessages = messages.filter(m => m.id !== messageId);
    
    if (filteredMessages.length === messages.length) return false;

    this.saveMessages(filteredMessages);
    return true;
  }

  async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<ChatMessage | null> {
    const messages = this.getMessages();
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) return null;

    messages[messageIndex] = {
      ...messages[messageIndex],
      ...updates
    };

    this.saveMessages(messages);
    return messages[messageIndex];
  }

  // Analytics and Insights
  async getChatAnalytics(agentId?: string, userId?: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    topTopics: Array<{ topic: string; count: number }>;
    activityByHour: Array<{ hour: number; count: number }>;
    emotionDistribution: Array<{ emotion: string; count: number }>;
  }> {
    const sessions = this.getSessions();
    const messages = this.getMessages();

    let filteredSessions = sessions;
    let filteredMessages = messages;

    if (agentId) {
      filteredSessions = filteredSessions.filter(s => s.agentId === agentId);
      filteredMessages = filteredMessages.filter(m => m.agentId === agentId);
    }

    if (userId) {
      filteredSessions = filteredSessions.filter(s => s.userId === userId);
      const userSessionIds = filteredSessions.map(s => s.id);
      filteredMessages = filteredMessages.filter(m => m.sessionId && userSessionIds.includes(m.sessionId));
    }

    const totalSessions = filteredSessions.length;
    const totalMessages = filteredMessages.length;
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    // Extract topics
    const topicCounts: Record<string, number> = {};
    filteredMessages.forEach(m => {
      const topic = m.metadata?.topic || 'general';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Activity by hour
    const hourCounts: Record<number, number> = {};
    filteredMessages.forEach(m => {
      const hour = m.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const activityByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourCounts[hour] || 0
    }));

    // Emotion distribution
    const emotionCounts: Record<string, number> = {};
    filteredMessages.forEach(m => {
      const emotion = m.metadata?.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const emotionDistribution = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession,
      topTopics,
      activityByHour,
      emotionDistribution
    };
  }

  // Export/Import functionality
  async exportChatHistory(agentId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const sessions = agentId 
      ? await this.getSessionsByAgent(agentId)
      : this.getSessions();
    
    const allMessages: Array<ChatMessage & { sessionTitle: string }> = [];

    for (const session of sessions) {
      const messages = await this.getMessagesBySession(session.id);
      messages.forEach(message => {
        allMessages.push({
          ...message,
          sessionTitle: session.title
        });
      });
    }

    if (format === 'json') {
      return JSON.stringify({
        sessions,
        messages: allMessages,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV format
      const headers = ['Session ID', 'Session Title', 'Message ID', 'Agent ID', 'Role', 'Content', 'Timestamp', 'Emotion', 'Topic'];
      const rows = allMessages.map(m => [
        m.sessionId,
        m.sessionTitle,
        m.id,
        m.agentId,
        m.role,
        `"${m.content.replace(/"/g, '""')}"`,
        m.timestamp.toISOString(),
        m.metadata?.emotion || '',
        m.metadata?.topic || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  async importChatHistory(jsonData: string): Promise<{ sessions: number; messages: number }> {
    try {
      const data = JSON.parse(jsonData);
      const sessions = data.sessions || [];
      const messages = data.messages || [];

      // Import sessions
      const existingSessions = this.getSessions();
      const newSessions = sessions.filter((s: ChatSession) => 
        !existingSessions.find(existing => existing.id === s.id)
      );
      
      this.saveSessions([...existingSessions, ...newSessions]);

      // Import messages
      const existingMessages = this.getMessages();
      const newMessages = messages.filter((m: ChatMessage) => 
        !existingMessages.find(existing => existing.id === m.id)
      );
      
      this.saveMessages([...existingMessages, ...newMessages]);

      return {
        sessions: newSessions.length,
        messages: newMessages.length
      };
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  // Utility methods
  private getSessions(): ChatSession[] {
    try {
      const data = this.storage.getItem('chat_sessions');
      return data ? JSON.parse(data).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      })) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  private saveSessions(sessions: ChatSession[]): void {
    try {
      this.storage.setItem('chat_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  private getMessages(): ChatMessage[] {
    try {
      const data = this.storage.getItem('chat_messages');
      return data ? JSON.parse(data).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  private saveMessages(messages: ChatMessage[]): void {
    try {
      this.storage.setItem('chat_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Singleton instance
export const chatHistoryService = new ChatHistoryService();