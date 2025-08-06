import ZAI from 'z-ai-web-dev-sdk';
import { toolsService } from './tools-service';
import { multiLLMService, MultiLLMConfig, EmotionalContext } from './multi-llm-service';

export interface AIServiceConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  useMultiLLM?: boolean;
  multiLLMConfig?: MultiLLMConfig;
}

export interface AIServiceResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  processingTime: number;
  multiLLMContributions?: any[];
  emotionalContext?: EmotionalContext;
}

export class AIService {
  private zai: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.zai = await ZAI.create();
      this.isInitialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
      throw new Error('AI Service initialization failed');
    }
  }

  async generateResponse(
    prompt: string,
    config: AIServiceConfig
  ): Promise<AIServiceResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Use Multi-LLM if enabled and configured
      if (config.useMultiLLM && config.multiLLMConfig) {
        const emotionalContext = multiLLMService.analyzeEmotionalContext(prompt);
        const multiLLMResponse = await multiLLMService.generateWithMultiLLM(
          prompt,
          config.multiLLMConfig,
          emotionalContext
        );

        return {
          content: multiLLMResponse.content,
          model: 'multi-llm',
          processingTime: multiLLMResponse.totalProcessingTime,
          multiLLMContributions: multiLLMResponse.modelContributions,
          emotionalContext
        };
      }

      // Single model generation
      const systemPrompt = config.systemPrompt || `You are a professional AI assistant. Provide accurate, helpful, and comprehensive responses.`;
      
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
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        model: config.model
      });

      const processingTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || 'No response generated';

      return {
        content,
        usage: completion.usage,
        model: config.model,
        processingTime
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateWithTools(
    prompt: string,
    config: AIServiceConfig,
    availableTools: string[]
  ): Promise<AIServiceResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Use Multi-LLM if enabled and configured
      if (config.useMultiLLM && config.multiLLMConfig) {
        const emotionalContext = multiLLMService.analyzeEmotionalContext(prompt);
        const multiLLMResponse = await multiLLMService.generateWithMultiLLM(
          prompt,
          config.multiLLMConfig,
          emotionalContext,
          availableTools
        );

        return {
          content: multiLLMResponse.content,
          model: 'multi-llm',
          processingTime: multiLLMResponse.totalProcessingTime,
          multiLLMContributions: multiLLMResponse.modelContributions,
          emotionalContext
        };
      }

      // Single model with tools
      const emotionalContext = multiLLMService.analyzeEmotionalContext(prompt);
      const systemPrompt = `${config.systemPrompt || 'You are a professional AI assistant.'}

User Context:
- Mood: ${emotionalContext.userMood}
- Urgency: ${emotionalContext.urgency}
- Complexity: ${emotionalContext.complexity}
- Desired tone: ${emotionalContext.emotionalTone}

Please adapt your response style accordingly.`;
      
      // First, determine if tools are needed
      const toolAnalysisPrompt = `
        Analyze the following request and determine if any of these tools are needed: ${availableTools.join(', ')}
        
        User request: ${prompt}
        
        Respond with a JSON object:
        {
          "needsTools": true/false,
          "requiredTools": ["tool1", "tool2"],
          "reasoning": "explanation"
        }
      `;

      const toolAnalysis = await this.generateResponse(toolAnalysisPrompt, {
        ...config,
        maxTokens: 500,
        temperature: 0.1
      });

      let toolResults: any[] = [];
      let finalPrompt = prompt;

      try {
        // Clean the response to extract JSON if it's wrapped in markdown code blocks
        let cleanContent = toolAnalysis.content;
        if (cleanContent.includes('```json')) {
          cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```/g, '');
        } else if (cleanContent.includes('```')) {
          cleanContent = cleanContent.replace(/```\n?/g, '').replace(/\n?```/g, '');
        }
        
        const analysis = JSON.parse(cleanContent.trim());
        
        if (analysis.needsTools && analysis.requiredTools.length > 0) {
          // Execute tools
          toolResults = await this.executeTools(analysis.requiredTools, prompt);
          
          // Incorporate tool results into the final prompt
          finalPrompt = `
            Original request: ${prompt}
            
            Tool results: ${JSON.stringify(toolResults)}
            
            Please provide a comprehensive response incorporating the tool results above.
          `;
        }
      } catch (parseError) {
        console.warn('Failed to parse tool analysis, proceeding without tools:', parseError);
        console.warn('Raw tool analysis content:', toolAnalysis.content);
      }

      // Generate final response
      const finalResponse = await this.generateResponse(finalPrompt, config);
      finalResponse.processingTime = Date.now() - startTime;
      finalResponse.emotionalContext = emotionalContext;

      return finalResponse;
    } catch (error) {
      console.error('Error in AI generation with tools:', error);
      throw new Error(`AI generation with tools failed: ${error.message}`);
    }
  }

  private async executeTools(tools: string[], prompt: string): Promise<any[]> {
    const results: any[] = [];

    for (const tool of tools) {
      try {
        const toolResult = await toolsService.executeTool(tool, { query: prompt });
        results.push(toolResult);
      } catch (toolError) {
        console.error(`Error executing tool ${tool}:`, toolError);
        results.push({ tool, error: toolError.message });
      }
    }

    return results;
  }

  async generateImage(prompt: string, size = '1024x1024'): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.zai.images.generations.create({
        prompt,
        size
      });

      return response.data[0].base64;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  // Enhanced method for emotional intelligence
  async generateEmotionalResponse(
    prompt: string,
    config: AIServiceConfig,
    userContext?: {
      mood?: string;
      urgency?: string;
      history?: string[];
    }
  ): Promise<AIServiceResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const emotionalContext = multiLLMService.analyzeEmotionalContext(prompt);

    // Override with provided context if available
    if (userContext) {
      if (userContext.mood) {
        emotionalContext.userMood = userContext.mood as any;
      }
      if (userContext.urgency) {
        emotionalContext.urgency = userContext.urgency as any;
      }
    }

    try {
      const enhancedSystemPrompt = `${config.systemPrompt || 'You are an emotionally intelligent AI assistant.'}

Emotional Context:
- User Mood: ${emotionalContext.userMood}
- Urgency Level: ${emotionalContext.urgency}
- Task Complexity: ${emotionalContext.complexity}
- Desired Communication Tone: ${emotionalContext.emotionalTone}

Communication Guidelines:
- Adapt your response style to match the user's emotional state
- Show empathy and understanding when user is frustrated or confused
- Be concise and direct when urgency is high
- Provide clear explanations when user seems confused
- Match enthusiasm when user is excited
- Always maintain professionalism while being emotionally appropriate

Recent Context: ${userContext?.history ? userContext.history.slice(-3).join('\n- ') : 'No recent context'}`;

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        model: config.model
      });

      const processingTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || 'No response generated';

      return {
        content,
        usage: completion.usage,
        model: config.model,
        processingTime,
        emotionalContext
      };
    } catch (error) {
      console.error('Error generating emotional response:', error);
      throw new Error(`Emotional response generation failed: ${error.message}`);
    }
  }
}

// Singleton instance
export const aiService = new AIService();