import ZAI from 'z-ai-web-dev-sdk';
import { emotionalIntelligenceService, EmotionalContext, ToneAnalysis } from './emotional-intelligence';

export interface MultiLLMExecutionRequest {
  prompt: string;
  config: {
    collaborationMode: "parallel" | "sequential" | "voting" | "hierarchical";
    combinationStrategy: "merge" | "vote" | "synthesis" | "critique_then_improve";
    models: Array<{
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
    }>;
  };
  context?: {
    previousMessages?: Array<{ role: string; content: string }>;
    taskType?: string;
    domain?: string;
    emotionalContext?: EmotionalContext;
    enableEmotionalIntelligence?: boolean;
  };
}

export interface MultiLLMExecutionResult {
  success: boolean;
  finalResponse: string;
  modelResponses: Array<{
    modelId: string;
    modelName: string;
    response: string;
    confidence: number;
    processingTime: number;
    role: string;
    emotionalAnalysis?: {
      emotion: string;
      tone: string;
      empathyLevel: number;
      adaptations: Array<{ type: string; description: string }>;
    };
  }>;
  collaborationMetrics: {
    totalProcessingTime: number;
    consensusScore: number;
    improvementIterations: number;
    usedStrategy: string;
  };
  error?: string;
}

export class MultiLLMExecutor {
  private zai: any;

  constructor() {
    this.zai = null;
  }

  private async initializeZAI() {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
    return this.zai;
  }

  async execute(request: MultiLLMExecutionRequest): Promise<MultiLLMExecutionResult> {
    try {
      const zai = await this.initializeZAI();
      const startTime = Date.now();
      
      // Filter enabled models
      const enabledModels = request.config.models.filter(m => m.enabled);
      
      if (enabledModels.length === 0) {
        throw new Error("No enabled models found");
      }

      let modelResponses: Array<{
        modelId: string;
        modelName: string;
        response: string;
        confidence: number;
        processingTime: number;
        role: string;
      }> = [];

      // Execute based on collaboration mode
      switch (request.config.collaborationMode) {
        case "parallel":
          modelResponses = await this.executeParallel(zai, request, enabledModels);
          break;
        case "sequential":
          modelResponses = await this.executeSequential(zai, request, enabledModels);
          break;
        case "voting":
          modelResponses = await this.executeVoting(zai, request, enabledModels);
          break;
        case "hierarchical":
          modelResponses = await this.executeHierarchical(zai, request, enabledModels);
          break;
        default:
          throw new Error(`Unknown collaboration mode: ${request.config.collaborationMode}`);
      }

      // Combine responses based on strategy
      const finalResponse = await this.combineResponses(
        zai, 
        modelResponses, 
        request.config.combinationStrategy,
        request.prompt
      );

      const totalProcessingTime = Date.now() - startTime;
      const consensusScore = this.calculateConsensusScore(modelResponses);

      return {
        success: true,
        finalResponse,
        modelResponses,
        collaborationMetrics: {
          totalProcessingTime,
          consensusScore,
          improvementIterations: this.countImprovementIterations(modelResponses),
          usedStrategy: request.config.combinationStrategy
        }
      };

    } catch (error) {
      console.error('Multi-LLM execution error:', error);
      return {
        success: false,
        finalResponse: '',
        modelResponses: [],
        collaborationMetrics: {
          totalProcessingTime: 0,
          consensusScore: 0,
          improvementIterations: 0,
          usedStrategy: request.config.combinationStrategy
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeParallel(zai: any, request: MultiLLMExecutionRequest, models: any[]) {
    const promises = models.map(async (model) => {
      const modelStartTime = Date.now();
      
      try {
        const responseObj = await this.callModel(zai, model, request.prompt, request.context);
        const processingTime = Date.now() - modelStartTime;
        
        const responseContent = typeof responseObj === 'object' ? responseObj.content : responseObj;
        const emotionalAnalysis = typeof responseObj === 'object' ? responseObj.emotionalAnalysis : undefined;
        
        return {
          modelId: model.id,
          modelName: model.name,
          response: responseContent,
          confidence: this.calculateConfidence(responseContent, model),
          processingTime,
          role: model.role,
          emotionalAnalysis
        };
      } catch (error) {
        const processingTime = Date.now() - modelStartTime;
        return {
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confidence: 0,
          processingTime,
          role: model.role
        };
      }
    });

    return await Promise.all(promises);
  }

  private async executeSequential(zai: any, request: MultiLLMExecutionRequest, models: any[]) {
    const responses: any[] = [];
    let context = request.context;

    for (const model of models) {
      const modelStartTime = Date.now();
      
      try {
        const response = await this.callModel(zai, model, request.prompt, context);
        const processingTime = Date.now() - modelStartTime;
        
        responses.push({
          modelId: model.id,
          modelName: model.name,
          response,
          confidence: this.calculateConfidence(response, model),
          processingTime,
          role: model.role
        });

        // Update context for next model
        context = {
          ...context,
          previousMessages: [
            ...(context?.previousMessages || []),
            { role: model.name, content: response }
          ]
        };
      } catch (error) {
        const processingTime = Date.now() - modelStartTime;
        responses.push({
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confidence: 0,
          processingTime,
          role: model.role
        });
      }
    }

    return responses;
  }

  private async executeVoting(zai: any, request: MultiLLMExecutionRequest, models: any[]) {
    // First get all responses in parallel
    const parallelResponses = await this.executeParallel(zai, request, models);
    
    // Then have models vote on the best response
    const votingPromises = parallelResponses.map(async (response) => {
      const model = models.find(m => m.id === response.modelId);
      if (!model) return response;

      try {
        const votePrompt = `
        Given the following responses to the prompt "${request.prompt}", vote for the best response and explain why:
        
        ${parallelResponses.map(r => `${r.modelName}: ${r.response}`).join('\n\n')}
        
        Provide your vote in the format: VOTE: [model_name] - REASON: [explanation]
        `;

        const voteResponse = await this.callModel(zai, model, votePrompt, request.context);
        
        // Parse vote
        const voteMatch = voteResponse.match(/VOTE:\s*([^-]+)\s*-?\s*REASON:\s*(.+)/i);
        if (voteMatch) {
          const votedModel = voteMatch[1].trim();
          const reason = voteMatch[2].trim();
          
          // Find the voted response
          const votedResponse = parallelResponses.find(r => 
            r.modelName.toLowerCase().includes(votedModel.toLowerCase())
          );
          
          if (votedResponse) {
            return {
              ...response,
              vote: votedResponse.modelId,
              voteReason: reason,
              confidence: response.confidence + 0.1 // Bonus for being voted for
            };
          }
        }
        
        return response;
      } catch (error) {
        return response;
      }
    });

    return await Promise.all(votingPromises);
  }

  private async executeHierarchical(zai: any, request: MultiLLMExecutionRequest, models: any[]) {
    const primaryModel = models.find(m => m.role === 'primary');
    const specialistModels = models.filter(m => m.role === 'specialist');
    const criticModel = models.find(m => m.role === 'critic');
    const synthesizerModel = models.find(m => m.role === 'synthesizer');

    const responses: any[] = [];

    // Step 1: Primary model analyzes the task
    if (primaryModel) {
      const analysisPrompt = `
      As the primary model, analyze this task and provide initial guidance:
      
      Task: ${request.prompt}
      
      Provide:
      1. Task breakdown
      2. Required expertise areas
      3. Suggested approach
      `;

      const primaryResponse = await this.callModel(zai, primaryModel, analysisPrompt, request.context);
      responses.push({
        modelId: primaryModel.id,
        modelName: primaryModel.name,
        response: primaryResponse,
        confidence: this.calculateConfidence(primaryResponse, primaryModel),
        processingTime: 100, // Simulated
        role: primaryModel.role
      });
    }

    // Step 2: Specialist models provide domain expertise
    if (specialistModels.length > 0) {
      const specialistPromises = specialistModels.map(async (model) => {
        const specialistPrompt = `
        As a specialist model, provide your expert input on this task:
        
        Task: ${request.prompt}
        Primary Analysis: ${primaryModel ? responses[0].response : 'N/A'}
        
        Provide your specialized expertise and recommendations.
        `;

        const specialistResponse = await this.callModel(zai, model, specialistPrompt, request.context);
        return {
          modelId: model.id,
          modelName: model.name,
          response: specialistResponse,
          confidence: this.calculateConfidence(specialistResponse, model),
          processingTime: 100, // Simulated
          role: model.role
        };
      });

      const specialistResponses = await Promise.all(specialistPromises);
      responses.push(...specialistResponses);
    }

    // Step 3: Critic model reviews and critiques
    if (criticModel) {
      const criticPrompt = `
      As a critic model, review the following responses and provide constructive criticism:
      
      Original Task: ${request.prompt}
      
      ${responses.map(r => `${r.modelName} (${r.role}): ${r.response}`).join('\n\n')}
      
      Identify strengths, weaknesses, and areas for improvement.
      `;

      const criticResponse = await this.callModel(zai, criticModel, criticPrompt, request.context);
      responses.push({
        modelId: criticModel.id,
        modelName: criticModel.name,
        response: criticResponse,
        confidence: this.calculateConfidence(criticResponse, criticModel),
        processingTime: 100, // Simulated
        role: criticModel.role
      });
    }

    // Step 4: Synthesizer model combines all inputs
    if (synthesizerModel) {
      const synthesisPrompt = `
      As a synthesizer model, combine all the following inputs into a comprehensive, cohesive response:
      
      Original Task: ${request.prompt}
      
      ${responses.map(r => `${r.modelName} (${r.role}): ${r.response}`).join('\n\n')}
      
      Create a final response that incorporates the best elements from all inputs.
      `;

      const synthesisResponse = await this.callModel(zai, synthesizerModel, synthesisPrompt, request.context);
      responses.push({
        modelId: synthesizerModel.id,
        modelName: synthesizerModel.name,
        response: synthesisResponse,
        confidence: this.calculateConfidence(synthesisResponse, synthesizerModel),
        processingTime: 100, // Simulated
        role: synthesizerModel.role
      });
    }

    return responses;
  }

  private async combineResponses(zai: any, responses: any[], strategy: string, originalPrompt: string) {
    switch (strategy) {
      case "merge":
        return responses.map(r => r.response).join('\n\n');
      
      case "vote":
        // Find response with highest confidence/votes
        const bestResponse = responses.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        return bestResponse.response;
      
      case "synthesis":
        const synthesisPrompt = `
        Synthesize the following responses into a single, optimal response:
        
        Original Prompt: ${originalPrompt}
        
        Responses:
        ${responses.map(r => `${r.modelName}: ${r.response}`).join('\n\n')}
        
        Create a comprehensive response that combines the best elements from all inputs.
        `;

        const synthesisResponse = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert at synthesizing multiple AI responses into optimal outputs.' },
            { role: 'user', content: synthesisPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });

        return synthesisResponse.choices[0]?.message?.content || 'Synthesis failed';
      
      case "critique_then_improve":
        // First, have models critique each other
        const critiquePrompt = `
        Critique the following responses and suggest improvements:
        
        Original Prompt: ${originalPrompt}
        
        Responses:
        ${responses.map(r => `${r.modelName}: ${r.response}`).join('\n\n')}
        
        Provide constructive criticism and specific improvement suggestions.
        `;

        const critiqueResponse = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert critic providing constructive feedback.' },
            { role: 'user', content: critiquePrompt }
          ],
          max_tokens: 1500,
          temperature: 0.3
        });

        // Then, create improved response
        const improvementPrompt = `
        Based on the following critique, create an improved response:
        
        Original Prompt: ${originalPrompt}
        
        Original Responses:
        ${responses.map(r => `${r.modelName}: ${r.response}`).join('\n\n')}
        
        Critique and Suggestions:
        ${critiqueResponse.choices[0]?.message?.content || 'No critique available'}
        
        Create an improved response that addresses all the feedback.
        `;

        const improvedResponse = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert at creating improved responses based on feedback.' },
            { role: 'user', content: improvementPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.4
        });

        return improvedResponse.choices[0]?.message?.content || 'Improvement failed';
      
      default:
        return responses.map(r => r.response).join('\n\n');
    }
  }

  private async callModel(zai: any, model: any, prompt: string, context?: any) {
    const systemPrompt = this.createSystemPrompt(model, context);
    
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...(context?.previousMessages || []),
        { role: 'user', content: prompt }
      ],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    });

    let finalResponse = response.choices[0]?.message?.content || 'No response generated';
    
    // Apply emotional intelligence if enabled
    if (context?.enableEmotionalIntelligence && context?.emotionalContext) {
      try {
        const toneAnalysis = emotionalIntelligenceService.analyzeTone(prompt);
        const emotionalResponse = emotionalIntelligenceService.generateEmotionalResponse(
          finalResponse,
          context.emotionalContext,
          toneAnalysis
        );
        
        finalResponse = emotionalResponse.content;
        
        // Return emotional analysis along with the response
        return {
          content: finalResponse,
          emotionalAnalysis: {
            emotion: emotionalResponse.emotion,
            tone: emotionalResponse.tone,
            empathyLevel: emotionalResponse.empathyLevel,
            adaptations: emotionalResponse.adaptations
          }
        };
      } catch (error) {
        console.warn('Emotional intelligence processing failed:', error);
        return { content: finalResponse };
      }
    }
    
    return { content: finalResponse };
  }

  private createSystemPrompt(model: any, context?: any) {
    let systemPrompt = `You are ${model.name}, an AI model with the role of ${model.role}. `;
    
    if (model.capabilities.length > 0) {
      systemPrompt += `Your capabilities include: ${model.capabilities.join(', ')}. `;
    }
    
    if (context?.taskType) {
      systemPrompt += `You are working on a ${context.taskType} task. `;
    }
    
    if (context?.domain) {
      systemPrompt += `The domain is ${context.domain}. `;
    }
    
    systemPrompt += `Provide a comprehensive, well-reasoned response.`;
    
    return systemPrompt;
  }

  private calculateConfidence(response: string, model: any): number {
    // Simple confidence calculation based on response quality indicators
    const confidence = model.weight || 1.0;
    
    // Adjust based on response length (very short or very long responses might be less confident)
    const lengthScore = Math.min(response.length / 1000, 1.0);
    
    // Adjust based on response structure (has paragraphs, bullet points, etc.)
    const structureScore = response.includes('\n') ? 0.1 : 0;
    
    return Math.min(confidence * lengthScore + structureScore, 1.0);
  }

  private calculateConsensusScore(responses: any[]): number {
    if (responses.length <= 1) return 1.0;
    
    // Simple consensus calculation based on response similarity
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const similarity = this.calculateTextSimilarity(responses[i].response, responses[j].response);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple text similarity based on word overlap
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private countImprovementIterations(responses: any[]): number {
    // Count how many times models reference or build upon previous responses
    let iterations = 0;
    
    for (let i = 1; i < responses.length; i++) {
      const currentResponse = responses[i].response.toLowerCase();
      const previousResponses = responses.slice(0, i).map(r => r.modelName.toLowerCase());
      
      for (const prevName of previousResponses) {
        if (currentResponse.includes(prevName) || 
            currentResponse.includes('previous') || 
            currentResponse.includes('building on') ||
            currentResponse.includes('improving')) {
          iterations++;
          break;
        }
      }
    }
    
    return iterations;
  }
}

// Singleton instance
export const multiLLMExecutor = new MultiLLMExecutor();