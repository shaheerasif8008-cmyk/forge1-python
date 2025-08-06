import ZAI from 'z-ai-web-dev-sdk';
import { toolsService } from './tools-service';

export interface LLMModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "zhipu" | "mistral";
  model: string;
  role: "primary" | "secondary" | "specialist" | "critic" | "synthesizer";
  capabilities: string[];
  temperature: number;
  maxTokens: number;
  weight: number;
  enabled: boolean;
}

export interface MultiLLMConfig {
  collaborationMode: "parallel" | "sequential" | "voting" | "hierarchical";
  combinationStrategy: "merge" | "vote" | "synthesis" | "critique_then_improve";
  maxModels: number;
  models: LLMModel[];
}

export interface MultiLLMResponse {
  content: string;
  modelContributions: Array<{
    modelId: string;
    modelName: string;
    response: string;
    processingTime: number;
    confidence: number;
  }>;
  combinationProcess: string;
  totalProcessingTime: number;
  success: boolean;
  error?: string;
}

export interface EmotionalContext {
  userMood: 'neutral' | 'happy' | 'frustrated' | 'urgent' | 'confused' | 'excited';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  emotionalTone: 'formal' | 'casual' | 'empathetic' | 'direct' | 'supportive';
}

export class MultiLLMService {
  private zai: any = null;
  private isInitialized = false;
  private modelPerformanceCache = new Map<string, {
    avgResponseTime: number;
    successRate: number;
    lastUsed: Date;
  }>();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.zai = await ZAI.create();
      this.isInitialized = true;
      console.log('Multi-LLM Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Multi-LLM Service:', error);
      throw new Error('Multi-LLM Service initialization failed');
    }
  }

  async generateWithMultiLLM(
    prompt: string,
    config: MultiLLMConfig,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<MultiLLMResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const enabledModels = config.models.filter(m => m.enabled);

    if (enabledModels.length === 0) {
      return {
        content: 'No models are enabled for multi-LLM processing.',
        modelContributions: [],
        combinationProcess: 'error',
        totalProcessingTime: 0,
        success: false,
        error: 'No enabled models'
      };
    }

    try {
      let result: MultiLLMResponse;

      switch (config.collaborationMode) {
        case 'parallel':
          result = await this.processParallel(prompt, enabledModels, config, emotionalContext, availableTools);
          break;
        case 'sequential':
          result = await this.processSequential(prompt, enabledModels, config, emotionalContext, availableTools);
          break;
        case 'voting':
          result = await this.processVoting(prompt, enabledModels, config, emotionalContext, availableTools);
          break;
        case 'hierarchical':
          result = await this.processHierarchical(prompt, enabledModels, config, emotionalContext, availableTools);
          break;
        default:
          throw new Error(`Unknown collaboration mode: ${config.collaborationMode}`);
      }

      result.totalProcessingTime = Date.now() - startTime;
      
      // Update performance cache
      this.updatePerformanceCache(result.modelContributions);
      
      return result;
    } catch (error) {
      console.error('Multi-LLM generation failed:', error);
      return {
        content: `Multi-LLM processing failed: ${error.message}`,
        modelContributions: [],
        combinationProcess: 'error',
        totalProcessingTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  private async processParallel(
    prompt: string,
    models: LLMModel[],
    config: MultiLLMConfig,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<MultiLLMResponse> {
    const startTime = Date.now();
    
    // Execute all models in parallel
    const promises = models.map(async (model) => {
      try {
        const modelStart = Date.now();
        const response = await this.generateWithSingleModel(
          prompt,
          model,
          emotionalContext,
          availableTools
        );
        
        return {
          modelId: model.id,
          modelName: model.name,
          response: response.content,
          processingTime: Date.now() - modelStart,
          confidence: this.calculateConfidence(response, model)
        };
      } catch (error) {
        return {
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error.message}`,
          processingTime: Date.now() - startTime,
          confidence: 0
        };
      }
    });

    const contributions = await Promise.all(promises);
    
    // Combine responses based on strategy
    const combinedContent = await this.combineResponses(
      contributions,
      config.combinationStrategy,
      prompt
    );

    return {
      content: combinedContent,
      modelContributions: contributions,
      combinationProcess: `parallel_${config.combinationStrategy}`,
      totalProcessingTime: Date.now() - startTime,
      success: true
    };
  }

  private async processSequential(
    prompt: string,
    models: LLMModel[],
    config: MultiLLMConfig,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<MultiLLMResponse> {
    const startTime = Date.now();
    const contributions: any[] = [];
    let currentPrompt = prompt;

    for (const model of models) {
      try {
        const modelStart = Date.now();
        const response = await this.generateWithSingleModel(
          currentPrompt,
          model,
          emotionalContext,
          availableTools
        );
        
        const contribution = {
          modelId: model.id,
          modelName: model.name,
          response: response.content,
          processingTime: Date.now() - modelStart,
          confidence: this.calculateConfidence(response, model)
        };
        
        contributions.push(contribution);
        
        // Update prompt for next model based on role
        if (model.role === 'critic') {
          currentPrompt = `Previous response: "${response.content}"\n\nPlease critique and improve this response to: ${prompt}`;
        } else if (model.role === 'synthesizer') {
          // Synthesizer gets all previous responses
          const allResponses = contributions.map(c => c.response).join('\n\n');
          currentPrompt = `Combine and synthesize these responses into a comprehensive answer to: ${prompt}\n\nResponses:\n${allResponses}`;
        } else {
          currentPrompt = prompt; // Reset for next model
        }
      } catch (error) {
        contributions.push({
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error.message}`,
          processingTime: Date.now() - startTime,
          confidence: 0
        });
      }
    }

    const finalContent = contributions[contributions.length - 1]?.response || 'No response generated';

    return {
      content: finalContent,
      modelContributions: contributions,
      combinationProcess: `sequential_${config.combinationStrategy}`,
      totalProcessingTime: Date.now() - startTime,
      success: true
    };
  }

  private async processVoting(
    prompt: string,
    models: LLMModel[],
    config: MultiLLMConfig,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<MultiLLMResponse> {
    const startTime = Date.now();
    
    // Get responses from all models
    const promises = models.map(async (model) => {
      try {
        const modelStart = Date.now();
        const response = await this.generateWithSingleModel(
          prompt,
          model,
          emotionalContext,
          availableTools
        );
        
        return {
          modelId: model.id,
          modelName: model.name,
          response: response.content,
          processingTime: Date.now() - modelStart,
          confidence: this.calculateConfidence(response, model),
          weight: model.weight
        };
      } catch (error) {
        return {
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error.message}`,
          processingTime: Date.now() - modelStart,
          confidence: 0,
          weight: model.weight
        };
      }
    });

    const contributions = await Promise.all(promises);
    
    // Weighted voting based on model weights and confidences
    const scoredResponses = contributions.map(c => ({
      ...c,
      score: c.confidence * c.weight
    }));
    
    // Select best response
    const bestResponse = scoredResponses.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      content: bestResponse.response,
      modelContributions: contributions,
      combinationProcess: `voting_${config.combinationStrategy}`,
      totalProcessingTime: Date.now() - startTime,
      success: true
    };
  }

  private async processHierarchical(
    prompt: string,
    models: LLMModel[],
    config: MultiLLMConfig,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<MultiLLMResponse> {
    const startTime = Date.now();
    
    // Find primary model
    const primaryModel = models.find(m => m.role === 'primary');
    if (!primaryModel) {
      throw new Error('No primary model found for hierarchical processing');
    }

    const contributions: any[] = [];
    
    // Primary model processes first
    try {
      const primaryStart = Date.now();
      const primaryResponse = await this.generateWithSingleModel(
        prompt,
        primaryModel,
        emotionalContext,
        availableTools
      );
      
      contributions.push({
        modelId: primaryModel.id,
        modelName: primaryModel.name,
        response: primaryResponse.content,
        processingTime: Date.now() - primaryStart,
        confidence: this.calculateConfidence(primaryResponse, primaryModel)
      });
      
      // Secondary models can refine or critique
      const secondaryModels = models.filter(m => m.role !== 'primary');
      for (const model of secondaryModels) {
        try {
          const modelStart = Date.now();
          const refinementPrompt = `Primary response: "${primaryResponse.content}"\n\nOriginal task: ${prompt}\n\nPlease ${model.role === 'critic' ? 'critique and improve' : 'refine and enhance'} this response.`;
          
          const refinementResponse = await this.generateWithSingleModel(
            refinementPrompt,
            model,
            emotionalContext,
            availableTools
          );
          
          contributions.push({
            modelId: model.id,
            modelName: model.name,
            response: refinementResponse.content,
            processingTime: Date.now() - modelStart,
            confidence: this.calculateConfidence(refinementResponse, model)
          });
        } catch (error) {
          contributions.push({
            modelId: model.id,
            modelName: model.name,
            response: `Error: ${error.message}`,
            processingTime: Date.now() - startTime,
            confidence: 0
          });
        }
      }
    } catch (error) {
      return {
        content: `Primary model failed: ${error.message}`,
        modelContributions: contributions,
        combinationProcess: `hierarchical_${config.combinationStrategy}`,
        totalProcessingTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }

    // Use primary response as final (could be enhanced with synthesis)
    const finalContent = contributions[0]?.response || 'No response generated';

    return {
      content: finalContent,
      modelContributions: contributions,
      combinationProcess: `hierarchical_${config.combinationStrategy}`,
      totalProcessingTime: Date.now() - startTime,
      success: true
    };
  }

  private async generateWithSingleModel(
    prompt: string,
    model: LLMModel,
    emotionalContext?: EmotionalContext,
    availableTools: string[] = []
  ): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(model, emotionalContext);
    
    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: model.temperature,
        max_tokens: model.maxTokens,
        model: model.model
      });

      return {
        content: completion.choices[0]?.message?.content || 'No response generated',
        usage: completion.usage,
        model: model.model
      };
    } catch (error) {
      console.error(`Error with model ${model.name}:`, error);
      throw new Error(`Model ${model.name} failed: ${error.message}`);
    }
  }

  private buildSystemPrompt(model: LLMModel, emotionalContext?: EmotionalContext): string {
    let prompt = `You are ${model.name}, an AI model with the role of ${model.role}.`;
    
    prompt += `\nYour capabilities include: ${model.capabilities.join(', ')}.`;
    
    if (emotionalContext) {
      prompt += `\n\nUser Context:
- Mood: ${emotionalContext.userMood}
- Urgency: ${emotionalContext.urgency}
- Complexity: ${emotionalContext.complexity}
- Desired tone: ${emotionalContext.emotionalTone}`;
      
      // Add emotional intelligence guidance
      switch (emotionalContext.userMood) {
        case 'frustrated':
          prompt += '\nPlease be patient, clear, and supportive. Acknowledge their frustration and provide straightforward solutions.';
          break;
        case 'urgent':
          prompt += '\nPlease be concise, direct, and action-oriented. Prioritize speed and clarity.';
          break;
        case 'confused':
          prompt += '\nPlease be educational, patient, and provide clear explanations with examples.';
          break;
        case 'excited':
          prompt += '\nPlease match their enthusiasm and be engaging while maintaining accuracy.';
          break;
      }
    }
    
    prompt += '\n\nProvide professional, accurate, and helpful responses based on your specialized expertise.';
    
    return prompt;
  }

  private async combineResponses(
    contributions: any[],
    strategy: string,
    originalPrompt: string
  ): Promise<string> {
    switch (strategy) {
      case 'merge':
        return contributions.map(c => c.response).join('\n\n');
        
      case 'vote':
        // Simple majority voting (could be enhanced with similarity scoring)
        const responseCounts = new Map<string, number>();
        contributions.forEach(c => {
          const key = c.response.substring(0, 100); // Simple key
          responseCounts.set(key, (responseCounts.get(key) || 0) + 1);
        });
        
        const mostCommon = Array.from(responseCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        return contributions.find(c => c.response.startsWith(mostCommon[0]))?.response || contributions[0].response;
        
      case 'synthesis':
        const allResponses = contributions.map(c => c.response).join('\n\n===\n\n');
        const synthesisPrompt = `Please synthesize these different AI responses into a single, comprehensive answer to: "${originalPrompt}"\n\nResponses:\n${allResponses}\n\nProvide the best combined response below:`;
        
        try {
          const synthesisResponse = await this.zai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are an expert at synthesizing multiple AI responses into optimal answers.'
              },
              {
                role: 'user',
                content: synthesisPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            model: 'gpt-4o'
          });
          
          return synthesisResponse.choices[0]?.message?.content || contributions[0].response;
        } catch (error) {
          console.warn('Synthesis failed, falling back to first response:', error);
          return contributions[0].response;
        }
        
      case 'critique_then_improve':
        if (contributions.length < 2) return contributions[0]?.response || '';
        
        const firstResponse = contributions[0].response;
        const critiquePrompt = `Please critique and improve this response to: "${originalPrompt}"\n\nOriginal response:\n${firstResponse}\n\nProvide an improved version below:`;
        
        try {
          const critiqueResponse = await this.zai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are an expert at critiquing and improving AI responses.'
              },
              {
                role: 'user',
                content: critiquePrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            model: 'gpt-4o'
          });
          
          return critiqueResponse.choices[0]?.message?.content || firstResponse;
        } catch (error) {
          console.warn('Critique failed, falling back to original response:', error);
          return firstResponse;
        }
        
      default:
        return contributions[0]?.response || '';
    }
  }

  private calculateConfidence(response: any, model: LLMModel): number {
    // Simple confidence calculation based on various factors
    let confidence = 0.5; // Base confidence
    
    // Adjust based on response length (very short or very long responses might be less confident)
    const contentLength = response.content?.length || 0;
    if (contentLength > 50 && contentLength < 2000) {
      confidence += 0.2;
    }
    
    // Adjust based on model role
    if (model.role === 'primary') confidence += 0.2;
    if (model.role === 'specialist') confidence += 0.1;
    
    // Adjust based on model weight
    confidence += (model.weight - 1) * 0.1;
    
    return Math.min(1, Math.max(0, confidence));
  }

  private updatePerformanceCache(contributions: any[]): void {
    contributions.forEach(contribution => {
      const existing = this.modelPerformanceCache.get(contribution.modelId);
      const newAvgTime = existing 
        ? (existing.avgResponseTime + contribution.processingTime) / 2
        : contribution.processingTime;
      
      this.modelPerformanceCache.set(contribution.modelId, {
        avgResponseTime: newAvgTime,
        successRate: contribution.response.includes('Error') ? existing?.successRate || 0.9 : 1,
        lastUsed: new Date()
      });
    });
  }

  analyzeEmotionalContext(message: string): EmotionalContext {
    const lowerMessage = message.toLowerCase();
    
    // Analyze mood
    let userMood: EmotionalContext['userMood'] = 'neutral';
    if (lowerMessage.includes('help') || lowerMessage.includes('please') || lowerMessage.includes('thank')) {
      userMood = 'happy';
    } else if (lowerMessage.includes('frustrat') || lowerMessage.includes('annoy') || lowerMessage.includes('hate')) {
      userMood = 'frustrated';
    } else if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('immediately')) {
      userMood = 'urgent';
    } else if (lowerMessage.includes('confus') || lowerMessage.includes('don\'t understand') || lowerMessage.includes('what do')) {
      userMood = 'confused';
    } else if (lowerMessage.includes('excit') || lowerMessage.includes('amazing') || lowerMessage.includes('love')) {
      userMood = 'excited';
    }
    
    // Analyze urgency
    let urgency: EmotionalContext['urgency'] = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('emergency')) {
      urgency = 'critical';
    } else if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('soon')) {
      urgency = 'high';
    } else if (lowerMessage.includes('when') || lowerMessage.includes('how')) {
      urgency = 'low';
    }
    
    // Analyze complexity
    let complexity: EmotionalContext['complexity'] = 'moderate';
    const complexWords = ['explain', 'detailed', 'comprehensive', 'thorough', 'in-depth'];
    const simpleWords = ['simple', 'basic', 'easy', 'quick'];
    
    if (complexWords.some(word => lowerMessage.includes(word))) {
      complexity = 'complex';
    } else if (simpleWords.some(word => lowerMessage.includes(word))) {
      complexity = 'simple';
    }
    
    // Analyze desired tone
    let emotionalTone: EmotionalContext['emotionalTone'] = 'formal';
    if (lowerMessage.includes('casual') || lowerMessage.includes('friendly') || lowerMessage.includes('chill')) {
      emotionalTone = 'casual';
    } else if (lowerMessage.includes('empath') || lowerMessage.includes('understand') || lowerMessage.includes('feel')) {
      emotionalTone = 'empathetic';
    } else if (lowerMessage.includes('direct') || lowerMessage.includes('straight') || lowerMessage.includes('honest')) {
      emotionalTone = 'direct';
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      emotionalTone = 'supportive';
    }
    
    return {
      userMood,
      urgency,
      complexity,
      emotionalTone
    };
  }

  getModelPerformanceStats(): Array<{
    modelId: string;
    avgResponseTime: number;
    successRate: number;
    lastUsed: Date;
  }> {
    return Array.from(this.modelPerformanceCache.entries()).map(([modelId, stats]) => ({
      modelId,
      ...stats
    }));
  }
}

// Singleton instance
export const multiLLMService = new MultiLLMService();