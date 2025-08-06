import { useToast } from '@/hooks/use-toast';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  context?: string;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useApi = () => {
  const { toast } = useToast();

  const request = async <T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      headers = {},
      body,
      context,
      showSuccessToast = false,
      successMessage,
      showErrorToast = true,
    } = options;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && showSuccessToast) {
        toast({
          title: "Success",
          description: successMessage || result.message || "Operation completed successfully",
        });
      }

      if (!result.success && showErrorToast) {
        toast({
          title: "Error",
          description: result.error || "Operation failed",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const contextMessage = context ? ` in ${context}` : '';
      
      console.error(`API Error${contextMessage}:`, errorMessage);

      if (showErrorToast) {
        toast({
          title: "API Error",
          description: `An error occurred${contextMessage}. Please try again.`,
          variant: "destructive",
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const get = <T = any>(url: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    request<T>(url, { ...options, method: 'GET' });

  const post = <T = any>(url: string, body: any, options: Omit<ApiRequestOptions, 'method'> = {}) =>
    request<T>(url, { ...options, method: 'POST', body });

  const put = <T = any>(url: string, body: any, options: Omit<ApiRequestOptions, 'method'> = {}) =>
    request<T>(url, { ...options, method: 'PUT', body });

  const del = <T = any>(url: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    request<T>(url, { ...options, method: 'DELETE' });

  return {
    request,
    get,
    post,
    put,
    del,
  };
};

// API endpoints constants
export const API_ENDPOINTS = {
  AGENTS: '/api/forge1/agents',
  ANALYTICS: '/api/forge1/analytics',
  SYSTEM: '/api/forge1/system',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
  },
  FORGE1: {
    VISUAL: '/api/forge1/visual',
    MEMORY: '/api/forge1/memory',
    RAG: '/api/forge1/rag',
    SECURITY: '/api/forge1/security',
    INTERFACE: '/api/forge1/interface',
    AGENT: '/api/forge1/agent',
    ACTIONS: '/api/forge1/actions',
    ASYNC: '/api/forge1/async',
    DEPLOYMENT: '/api/forge1/deployment',
    DEV: '/api/forge1/dev',
    MULTIMODAL: '/api/forge1/multimodal',
    STATUS: '/api/forge1/status',
    TEST_AGENT: '/api/forge1/test-agent',
  },
} as const;