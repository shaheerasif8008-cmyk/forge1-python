/**
 * Model Router Service for Forge1
 * 
 * This service handles intelligent model selection, routing, and fallback mechanisms
 * for multi-model LLM operations.
 */

import { 
  LLMModel, 
  ModelProvider, 
  ModelSelectionStrategy, 
  TaskType, 
  LLM_MODELS, 
  MODEL_PROVIDERS,
  getBestModelForTask,
  getFallbackModel,
  getModelById
} from '../config/models';

export interface ModelRequest {
  id: string;
  taskType: TaskType;
  prompt: string;
  strategy: ModelSelectionStrategy;
  preferredModel?: string;
  maxTokens?: number;
  temperature?: number;
  context?: any;
}

export interface ModelResponse {
  id: string;
  modelId: string;
  provider: string;
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  cost: number;
  latency: number;
  fallbackUsed: boolean;
  success: boolean;
  error?: string;
}

export interface ModelRoutingLog {
  id: string;
  timestamp: Date;
  request: ModelRequest;
  response: ModelResponse;
  routingDecision: {
    selectedModel: string;
    reasoning: string;
    fallbackChain?: string[];
  };
}

class ModelRouterService {
  private routingLogs: ModelRoutingLog[] = [];
  private activeRequests: Map<string, Promise<ModelResponse>> = new Map();

  /**
   * Route a request to the best available model
   */
  async routeRequest(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      // Check if we already have an identical request in progress
      const requestKey = this.generateRequestKey(request);
      if (this.activeRequests.has(requestKey)) {
        return await this.activeRequests.get(requestKey)!;
      }

      // Create the response promise
      const responsePromise = this.executeRequest(request);
      this.activeRequests.set(requestKey, responsePromise);

      // Execute and clean up
      const response = await responsePromise;
      this.activeRequests.delete(requestKey);

      return response;
    } catch (error) {
      console.error('Model routing error:', error);
      return {
        id: request.id,
        modelId: 'error',
        provider: 'error',
        content: '',
        tokensUsed: { input: 0, output: 0 },
        cost: 0,
        latency: Date.now() - startTime,
        fallbackUsed: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeRequest(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    const routingDecision = this.selectModel(request);
    let fallbackChain: string[] = [];
    let finalModel = routingDecision.selectedModel;
    let response: ModelResponse | null = null;

    // Try the selected model first
    response = await this.tryModel(finalModel, request);
    
    if (!response.success && response.error) {
      // Use fallback mechanism
      const fallbackModel = getFallbackModel(finalModel);
      if (fallbackModel) {
        fallbackChain.push(finalModel);
        finalModel = fallbackModel.id;
        response = await this.tryModel(finalModel, request);
      }
    }

    // If still failing, try to get any available model for the task
    if (!response.success && response.error) {
      const anyModel = getBestModelForTask(request.taskType, 'balanced');
      if (anyModel && anyModel.id !== finalModel) {
        fallbackChain.push(finalModel);
        finalModel = anyModel.id;
        response = await this.tryModel(finalModel, request);
      }
    }

    const latency = Date.now() - startTime;

    // Log the routing decision
    this.logRouting({
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      request,
      response,
      routingDecision: {
        selectedModel: finalModel,
        reasoning: routingDecision.reasoning,
        fallbackChain: fallbackChain.length > 0 ? fallbackChain : undefined
      }
    });

    return {
      ...response,
      latency,
      fallbackUsed: fallbackChain.length > 0
    };
  }

  private selectModel(request: ModelRequest) {
    let selectedModel: string;
    let reasoning: string;

    if (request.preferredModel) {
      // User has a preferred model
      const model = getModelById(request.preferredModel);
      if (model && model.status === 'available') {
        selectedModel = model.id;
        reasoning = `User preferred model: ${model.name}`;
      } else {
        // Preferred model not available, fall back to automatic selection
        const bestModel = getBestModelForTask(request.taskType, request.strategy);
        if (bestModel) {
          selectedModel = bestModel.id;
          reasoning = `Preferred model unavailable, selected best model for task: ${bestModel.name}`;
        } else {
          // No specific model for task, use any available model
          const availableModels = Object.values(LLM_MODELS).filter(m => m.status === 'available');
          selectedModel = availableModels[0]?.id || 'gpt-o1';
          reasoning = 'No task-specific model available, used first available model';
        }
      }
    } else {
      // Automatic model selection
      const bestModel = getBestModelForTask(request.taskType, request.strategy);
      if (bestModel) {
        selectedModel = bestModel.id;
        reasoning = `Selected best model for ${request.taskType} with ${request.strategy} strategy: ${bestModel.name}`;
      } else {
        // Fallback to any available model
        const availableModels = Object.values(LLM_MODELS).filter(m => m.status === 'available');
        selectedModel = availableModels[0]?.id || 'gpt-o1';
        reasoning = 'No task-specific model available, used first available model';
      }
    }

    return { selectedModel, reasoning };
  }

  private async tryModel(modelId: string, request: ModelRequest): Promise<ModelResponse> {
    const model = getModelById(modelId);
    if (!model) {
      return {
        id: request.id,
        modelId,
        provider: 'unknown',
        content: '',
        tokensUsed: { input: 0, output: 0 },
        cost: 0,
        latency: 0,
        fallbackUsed: false,
        success: false,
        error: `Model ${modelId} not found`
      };
    }

    const provider = MODEL_PROVIDERS[model.provider];
    if (!provider || provider.status !== 'active') {
      return {
        id: request.id,
        modelId,
        provider: model.provider,
        content: '',
        tokensUsed: { input: 0, output: 0 },
        cost: 0,
        latency: 0,
        fallbackUsed: false,
        success: false,
        error: `Provider ${model.provider} is not active`
      };
    }

    try {
      // Here you would integrate with the actual AI service
      // For now, we'll simulate the response
      const response = await this.callModelAPI(model, provider, request);
      
      return {
        id: request.id,
        modelId,
        provider: model.provider,
        content: response.content,
        tokensUsed: response.tokensUsed,
        cost: this.calculateCost(model, response.tokensUsed),
        latency: response.latency,
        fallbackUsed: false,
        success: true
      };
    } catch (error) {
      return {
        id: request.id,
        modelId,
        provider: model.provider,
        content: '',
        tokensUsed: { input: 0, output: 0 },
        cost: 0,
        latency: 0,
        fallbackUsed: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling model'
      };
    }
  }

  private async callModelAPI(
    model: LLMModel, 
    provider: ModelProvider, 
    request: ModelRequest
  ): Promise<{ content: string; tokensUsed: { input: number; output: number }; latency: number }> {
    // Simulate API call - in real implementation, this would call the actual LLM API
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const inputTokens = Math.ceil(request.prompt.length / 4); // Rough estimate
    const outputTokens = Math.floor(Math.random() * 500) + 100; // Simulated response length
    
    return {
      content: `Simulated response from ${model.name} for task: ${request.taskType}. This is where the actual AI response would appear.`,
      tokensUsed: { input: inputTokens, output: outputTokens },
      latency: 150 + Math.random() * 100
    };
  }

  private calculateCost(model: LLMModel, tokensUsed: { input: number; output: number }): number {
    return (tokensUsed.input * model.costPer1kTokens.input / 1000) + 
           (tokensUsed.output * model.costPer1kTokens.output / 1000);
  }

  private generateRequestKey(request: ModelRequest): string {
    return `${request.taskType}_${request.strategy}_${request.preferredModel || 'auto'}_${request.prompt.slice(0, 50)}`;
  }

  private logRouting(log: ModelRoutingLog) {
    this.routingLogs.push(log);
    
    // Keep only last 1000 logs in memory
    if (this.routingLogs.length > 1000) {
      this.routingLogs = this.routingLogs.slice(-1000);
    }
  }

  /**
   * Get routing analytics and statistics
   */
  getRoutingAnalytics() {
    const logs = this.routingLogs;
    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.response.success).length;
    const fallbackUsed = logs.filter(log => log.response.fallbackUsed).length;

    const modelUsage: Record<string, number> = {};
    const providerUsage: Record<string, number> = {};
    const taskTypeUsage: Record<string, number> = {};

    logs.forEach(log => {
      const modelId = log.response.modelId;
      const provider = log.response.provider;
      const taskType = log.request.taskType;

      modelUsage[modelId] = (modelUsage[modelId] || 0) + 1;
      providerUsage[provider] = (providerUsage[provider] || 0) + 1;
      taskTypeUsage[taskType] = (taskTypeUsage[taskType] || 0) + 1;
    });

    const averageLatency = logs.reduce((sum, log) => sum + log.response.latency, 0) / totalRequests || 0;
    const totalCost = logs.reduce((sum, log) => sum + log.response.cost, 0);

    return {
      totalRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      fallbackRate: totalRequests > 0 ? (fallbackUsed / totalRequests) * 100 : 0,
      averageLatency,
      totalCost,
      modelUsage,
      providerUsage,
      taskTypeUsage,
      recentLogs: logs.slice(-10) // Last 10 logs
    };
  }

  /**
   * Get all routing logs
   */
  getRoutingLogs(limit: number = 100): ModelRoutingLog[] {
    return this.routingLogs.slice(-limit);
  }

  /**
   * Clear routing logs
   */
  clearLogs() {
    this.routingLogs = [];
  }

  /**
   * Get available models for a specific task
   */
  getAvailableModelsForTask(taskType: TaskType): LLMModel[] {
    return Object.values(LLM_MODELS).filter(model => 
      model.status === 'available' && 
      (model.bestFor.includes(taskType) || model.capabilities.some(cap => 
        taskType.toLowerCase().includes(cap.toLowerCase())
      ))
    );
  }

  /**
   * Get model health status
   */
  getModelHealth(): Record<string, { status: string; latency: number; errorRate: number }> {
    const modelHealth: Record<string, any> = {};
    
    Object.values(LLM_MODELS).forEach(model => {
      const modelLogs = this.routingLogs.filter(log => log.response.modelId === model.id);
      const totalRequests = modelLogs.length;
      const successfulRequests = modelLogs.filter(log => log.response.success).length;
      const averageLatency = totalRequests > 0 
        ? modelLogs.reduce((sum, log) => sum + log.response.latency, 0) / totalRequests 
        : 0;
      const errorRate = totalRequests > 0 
        ? ((totalRequests - successfulRequests) / totalRequests) * 100 
        : 0;

      modelHealth[model.id] = {
        status: model.status,
        latency: averageLatency,
        errorRate
      };
    });

    return modelHealth;
  }
}

// Export singleton instance
export const modelRouter = new ModelRouterService();