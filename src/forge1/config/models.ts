/**
 * Multi-Model LLM Configuration for Forge1
 * 
 * This configuration defines all available LLM models with their metadata,
 * capabilities, and routing information.
 */

export interface LLMModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'zhipu';
  description: string;
  capabilities: string[];
  maxTokens: number;
  supportsStreaming: boolean;
  supportsMultimodal: boolean;
  supportsFunctionCalling: boolean;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  speed: 'fast' | 'medium' | 'slow';
  quality: 'low' | 'medium' | 'high' | 'premium';
  bestFor: string[];
  fallbackModels: string[];
  status: 'available' | 'degraded' | 'unavailable';
}

export interface ModelProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: LLMModel[];
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  status: 'active' | 'inactive' | 'error';
}

export const LLM_MODELS: Record<string, LLMModel> = {
  // OpenAI Models
  'gpt-o1': {
    id: 'gpt-o1',
    name: 'GPT-O1',
    provider: 'openai',
    description: 'Latest OpenAI model with enhanced reasoning capabilities',
    capabilities: ['reasoning', 'code', 'analysis', 'creative-writing'],
    maxTokens: 128000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.015, output: 0.06 },
    speed: 'medium',
    quality: 'premium',
    bestFor: ['complex-reasoning', 'code-generation', 'strategic-planning'],
    fallbackModels: ['gpt-o1-pro', 'gpt-4o'],
    status: 'available'
  },
  'gpt-o1-pro': {
    id: 'gpt-o1-pro',
    name: 'GPT-O1 Pro',
    provider: 'openai',
    description: 'Professional version of GPT-O1 with extended context',
    capabilities: ['reasoning', 'code', 'analysis', 'creative-writing', 'research'],
    maxTokens: 200000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.03, output: 0.12 },
    speed: 'medium',
    quality: 'premium',
    bestFor: ['enterprise-tasks', 'complex-analysis', 'research'],
    fallbackModels: ['gpt-o1', 'gpt-4o'],
    status: 'available'
  },
  'gpt-o3': {
    id: 'gpt-o3',
    name: 'GPT-O3',
    provider: 'openai',
    description: 'Next-generation OpenAI model with optimized performance',
    capabilities: ['reasoning', 'code', 'analysis', 'multimodal', 'function-calling'],
    maxTokens: 256000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.02, output: 0.08 },
    speed: 'fast',
    quality: 'premium',
    bestFor: ['real-time-applications', 'multimodal-tasks', 'function-calling'],
    fallbackModels: ['gpt-o3-pro', 'gpt-o1'],
    status: 'available'
  },
  'gpt-o3-pro': {
    id: 'gpt-o3-pro',
    name: 'GPT-O3 Pro',
    provider: 'openai',
    description: 'Professional version of GPT-O3 with maximum capabilities',
    capabilities: ['reasoning', 'code', 'analysis', 'multimodal', 'function-calling', 'enterprise'],
    maxTokens: 320000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.04, output: 0.16 },
    speed: 'fast',
    quality: 'premium',
    bestFor: ['enterprise-applications', 'large-scale-analysis', 'multimodal-processing'],
    fallbackModels: ['gpt-o3', 'gpt-o1-pro'],
    status: 'available'
  },
  'gpt-oss-120b': {
    id: 'gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'openai',
    description: 'Open-source 120B parameter model for cost-effective solutions',
    capabilities: ['reasoning', 'code', 'analysis', 'basic-multimodal'],
    maxTokens: 64000,
    supportsStreaming: true,
    supportsMultimodal: false,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.005, output: 0.015 },
    speed: 'medium',
    quality: 'high',
    bestFor: ['cost-effective-tasks', 'batch-processing', 'code-generation'],
    fallbackModels: ['gpt-4o', 'claude-opus-4'],
    status: 'available'
  },

  // Anthropic Models
  'claude-opus-4': {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Latest Anthropic model with superior reasoning and safety',
    capabilities: ['reasoning', 'analysis', 'creative-writing', 'safety-focused'],
    maxTokens: 200000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    speed: 'medium',
    quality: 'premium',
    bestFor: ['safety-critical', 'complex-reasoning', 'creative-writing'],
    fallbackModels: ['claude-opus-4-1', 'gpt-o1'],
    status: 'available'
  },
  'claude-opus-4-1': {
    id: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    description: 'Enhanced version of Claude Opus 4 with improved accuracy',
    capabilities: ['reasoning', 'analysis', 'creative-writing', 'safety-focused', 'research'],
    maxTokens: 200000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.02, output: 0.10 },
    speed: 'medium',
    quality: 'premium',
    bestFor: ['high-accuracy-tasks', 'research', 'safety-critical-applications'],
    fallbackModels: ['claude-opus-4', 'gpt-o1-pro'],
    status: 'available'
  },

  // Google Models
  'gemini-2-5-flash': {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Google\'s fastest multimodal model with enterprise capabilities',
    capabilities: ['multimodal', 'reasoning', 'code', 'analysis', 'enterprise'],
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.001, output: 0.004 },
    speed: 'fast',
    quality: 'high',
    bestFor: ['real-time-multimodal', 'large-scale-processing', 'cost-effective'],
    fallbackModels: ['gpt-4o', 'claude-opus-4'],
    status: 'available'
  },

  // Zhipu/Z.AI Models
  'glm-4-5': {
    id: 'glm-4-5',
    name: 'GLM-4.5',
    provider: 'zhipu',
    description: 'Latest Zhipu model with strong multilingual capabilities',
    capabilities: ['multilingual', 'reasoning', 'code', 'analysis', 'chinese-optimized'],
    maxTokens: 128000,
    supportsStreaming: true,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    costPer1kTokens: { input: 0.008, output: 0.032 },
    speed: 'medium',
    quality: 'high',
    bestFor: ['multilingual-tasks', 'chinese-applications', 'cost-effective'],
    fallbackModels: ['gpt-4o', 'gemini-2-5-flash'],
    status: 'available'
  }
};

export const MODEL_PROVIDERS: Record<string, ModelProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
    models: Object.values(LLM_MODELS).filter(model => model.provider === 'openai'),
    rateLimit: {
      requestsPerMinute: 500,
      tokensPerMinute: 150000
    },
    status: 'active'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    models: Object.values(LLM_MODELS).filter(model => model.provider === 'anthropic'),
    rateLimit: {
      requestsPerMinute: 1000,
      tokensPerMinute: 100000
    },
    status: 'active'
  },
  google: {
    id: 'google',
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GOOGLE_API_KEY || '',
    models: Object.values(LLM_MODELS).filter(model => model.provider === 'google'),
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 1000000
    },
    status: 'active'
  },
  zhipu: {
    id: 'zhipu',
    name: 'Zhipu AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZHIPU_API_KEY || '',
    models: Object.values(LLM_MODELS).filter(model => model.provider === 'zhipu'),
    rateLimit: {
      requestsPerMinute: 100,
      tokensPerMinute: 50000
    },
    status: 'active'
  }
};

// Model selection strategies
export type ModelSelectionStrategy = 
  | 'cost-optimized'
  | 'speed-optimized'
  | 'quality-optimized'
  | 'balanced'
  | 'manual';

// Task types for automatic model selection
export type TaskType = 
  | 'code-generation'
  | 'creative-writing'
  | 'analysis'
  | 'reasoning'
  | 'multimodal'
  | 'function-calling'
  | 'research'
  | 'safety-critical'
  | 'multilingual'
  | 'enterprise';

// Task to model mapping
export const TASK_TO_MODEL_MAPPING: Record<TaskType, string[]> = {
  'code-generation': ['gpt-o3', 'gpt-o1', 'gpt-oss-120b', 'glm-4-5'],
  'creative-writing': ['claude-opus-4', 'gpt-o1', 'gpt-o3-pro'],
  'analysis': ['gpt-o1-pro', 'claude-opus-4-1', 'gpt-o3'],
  'reasoning': ['gpt-o1-pro', 'claude-opus-4', 'gpt-o3-pro'],
  'multimodal': ['gemini-2-5-flash', 'gpt-o3', 'gpt-o1-pro'],
  'function-calling': ['gpt-o3', 'gpt-o1', 'claude-opus-4-1'],
  'research': ['claude-opus-4-1', 'gpt-o1-pro', 'gpt-oss-120b'],
  'safety-critical': ['claude-opus-4', 'claude-opus-4-1'],
  'multilingual': ['glm-4-5', 'gpt-o1-pro', 'gemini-2-5-flash'],
  'enterprise': ['gpt-o3-pro', 'gpt-o1-pro', 'claude-opus-4-1']
};

// Helper functions
export function getModelById(modelId: string): LLMModel | undefined {
  return LLM_MODELS[modelId];
}

export function getModelsByProvider(provider: string): LLMModel[] {
  return Object.values(LLM_MODELS).filter(model => model.provider === provider);
}

export function getModelsByTask(taskType: TaskType): LLMModel[] {
  const modelIds = TASK_TO_MODEL_MAPPING[taskType] || [];
  return modelIds.map(id => LLM_MODELS[id]).filter(Boolean);
}

export function getBestModelForTask(
  taskType: TaskType, 
  strategy: ModelSelectionStrategy = 'balanced'
): LLMModel | null {
  const candidateModels = getModelsByTask(taskType);
  if (candidateModels.length === 0) return null;

  // Filter available models
  const availableModels = candidateModels.filter(model => model.status === 'available');
  if (availableModels.length === 0) return null;

  // Sort based on strategy
  switch (strategy) {
    case 'cost-optimized':
      return availableModels.reduce((best, current) => 
        current.costPer1kTokens.input < best.costPer1kTokens.input ? current : best
      );
    case 'speed-optimized':
      return availableModels.find(model => model.speed === 'fast') || availableModels[0];
    case 'quality-optimized':
      return availableModels.find(model => model.quality === 'premium') || availableModels[0];
    case 'balanced':
    default:
      // Use a scoring system: quality (weighted) + speed + cost efficiency
      return availableModels.reduce((best, current) => {
        const bestScore = calculateModelScore(best);
        const currentScore = calculateModelScore(current);
        return currentScore > bestScore ? current : best;
      });
  }
}

function calculateModelScore(model: LLMModel): number {
  const qualityScore = model.quality === 'premium' ? 3 : model.quality === 'high' ? 2 : 1;
  const speedScore = model.speed === 'fast' ? 2 : model.speed === 'medium' ? 1 : 0;
  const costScore = 1 / (model.costPer1kTokens.input + model.costPer1kTokens.output);
  
  return qualityScore * 2 + speedScore + costScore;
}

export function getFallbackModel(modelId: string): LLMModel | null {
  const model = getModelById(modelId);
  if (!model || !model.fallbackModels.length) return null;
  
  for (const fallbackId of model.fallbackModels) {
    const fallbackModel = getModelById(fallbackId);
    if (fallbackModel && fallbackModel.status === 'available') {
      return fallbackModel;
    }
  }
  
  return null;
}