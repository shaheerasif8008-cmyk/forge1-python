import axios from 'axios'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast({
        title: "Session expired",
        description: "Please log in again",
        variant: "destructive",
      })
    }
    
    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred'
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
    
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  verifyToken: () => api.get('/auth/verify'),
}

// Agents API
export const agentsApi = {
  getAgents: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get('/agents', { params }),
  
  createAgent: (agentData: any) =>
    api.post('/agents', agentData),
  
  getAgent: (agentId: string) =>
    api.get(`/agents/${agentId}`),
  
  updateAgent: (agentId: string, agentData: any) =>
    api.put(`/agents/${agentId}`, agentData),
  
  deleteAgent: (agentId: string) =>
    api.delete(`/agents/${agentId}`),
  
  deployAgent: (agentId: string) =>
    api.post(`/agents/${agentId}/deploy`),
  
  testAgent: (agentId: string) =>
    api.post(`/agents/${agentId}/test`),
}

// Conversations API
export const conversationsApi = {
  getConversations: (params?: { agent_id?: string; skip?: number; limit?: number }) =>
    api.get('/conversations', { params }),
  
  createConversation: (conversationData: any) =>
    api.post('/conversations', conversationData),
  
  getConversation: (conversationId: string) =>
    api.get(`/conversations/${conversationId}`),
  
  addMessage: (conversationId: string, message: any) =>
    api.post(`/conversations/${conversationId}/message`, message),
  
  deleteConversation: (conversationId: string) =>
    api.delete(`/conversations/${conversationId}`),
}

// Analytics API
export const analyticsApi = {
  getAnalytics: (params?: { event_type?: string; agent_id?: string; start_date?: string; end_date?: string }) =>
    api.get('/analytics', { params }),
  
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  
  getAgentPerformance: (agentId: string, days?: number) =>
    api.get(`/analytics/agents/${agentId}/performance`, { params: { days } }),
  
  createAnalytics: (analyticsData: any) =>
    api.post('/analytics', analyticsData),
}

// Tools API
export const toolsApi = {
  getToolExecutions: (params?: { agent_id?: string; conversation_id?: string; tool_name?: string }) =>
    api.get('/tools', { params }),
  
  executeTool: (toolData: any) =>
    api.post('/tools', toolData),
  
  getAvailableTools: () =>
    api.get('/tools/tools'),
  
  getToolStats: () =>
    api.get('/tools/stats'),
}

// Forge 1 API
export const forge1Api = {
  processMultimodal: (data: any) =>
    api.post('/forge1/multimodal', data),
  
  multiLLMOrchestration: (data: any) =>
    api.post('/forge1/multi-llm', data),
  
  emotionalIntelligence: (data: any) =>
    api.post('/forge1/emotional-intelligence', data),
  
  agentChat: (agentId: string, data: any) =>
    api.post(`/forge1/agent/${agentId}/chat`, data),
  
  getAvailableModels: () =>
    api.get('/forge1/models'),
  
  testAgent: (data: any) =>
    api.post('/forge1/test-agent', data),
}

// Health API
export const healthApi = {
  getHealth: () =>
    api.get('/health/'),
  
  getDatabaseHealth: () =>
    api.get('/health/database'),
  
  getAIServicesHealth: () =>
    api.get('/health/ai-services'),
  
  getSystemMetrics: () =>
    api.get('/health/metrics'),
  
  getUptime: () =>
    api.get('/health/uptime'),
}

export default api