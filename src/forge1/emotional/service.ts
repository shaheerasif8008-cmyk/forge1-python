// ZAI SDK should only be used in backend API routes
// import ZAI from 'z-ai-web-dev-sdk';

export interface EmotionalAnalysis {
  id: string;
  content_type: 'text' | 'speech' | 'video' | 'image' | 'conversation';
  content: string;
  analysis_type: 'emotion_detection' | 'sentiment_analysis' | 'personality_analysis' | 'mood_tracking';
  result: EmotionalResult;
  confidence: number;
  processing_time: number;
  created_at: Date;
}

export interface EmotionalResult {
  primary_emotion: EmotionData;
  secondary_emotions?: EmotionData[];
  sentiment: SentimentData;
  personality_traits?: PersonalityTrait[];
  mood_state?: MoodState;
  behavioral_indicators?: BehavioralIndicator[];
  recommendations?: EmotionalRecommendation[];
}

export interface EmotionData {
  emotion: string;
  intensity: number; // 0-1
  confidence: number; // 0-1
  description: string;
  triggers?: string[];
}

export interface SentimentData {
  polarity: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0-1
  aspects?: SentimentAspect[];
}

export interface SentimentAspect {
  aspect: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export interface PersonalityTrait {
  trait: string;
  score: number; // 0-1
  confidence: number; // 0-1
  description: string;
}

export interface MoodState {
  current_mood: string;
  mood_intensity: number; // 0-1
  mood_trend: 'improving' | 'declining' | 'stable';
  factors: string[];
  duration?: string;
}

export interface BehavioralIndicator {
  behavior: string;
  intensity: number; // 0-1
  frequency: number; // 0-1
  interpretation: string;
}

export interface EmotionalRecommendation {
  type: 'response' | 'intervention' | 'support' | 'escalation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action: string;
  expected_outcome: string;
}

export interface EmotionalProfile {
  id: string;
  user_id?: string;
  name: string;
  baseline_emotions: EmotionData[];
  personality_profile: PersonalityTrait[];
  communication_style: string;
  emotional_patterns: EmotionalPattern[];
  created_at: Date;
  updated_at: Date;
}

export interface EmotionalPattern {
  pattern_type: 'trigger' | 'response' | 'coping' | 'escalation';
  description: string;
  frequency: number;
  contexts: string[];
  effectiveness?: number;
}

export interface EmotionalConversation {
  id: string;
  participant_a: string;
  participant_b: string;
  messages: EmotionalMessage[];
  emotional_flow: EmotionalFlow[];
  overall_sentiment: SentimentData;
  conflict_points: ConflictPoint[];
  resolution_suggestions?: string[];
  created_at: Date;
}

export interface EmotionalMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  emotional_state: EmotionData;
  sentiment: SentimentData;
  intent?: string;
}

export interface EmotionalFlow {
  timestamp: Date;
  emotional_shift: {
    from: EmotionData;
    to: EmotionData;
  };
  trigger?: string;
  intensity_change: number;
}

export interface ConflictPoint {
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  participants: string[];
  description: string;
  emotional_states: Record<string, EmotionData>;
  suggested_resolution?: string;
}

export class EmotionalAIService {
  private zai: any;

  constructor() {
    // ZAI SDK should only be used in backend API routes
    // this.initializeZAI();
  }

  private async initializeZAI() {
    try {
      this.zai = await ZAI.create();
    } catch (error) {
      console.error('Failed to initialize ZAI:', error);
    }
  }

  async analyzeEmotion(
    content: string,
    contentType: EmotionalAnalysis['content_type'] = 'text',
    analysisType: EmotionalAnalysis['analysis_type'] = 'emotion_detection'
  ): Promise<EmotionalAnalysis> {
    const startTime = Date.now();

    try {
      const result = await this.performEmotionalAnalysis(content, contentType, analysisType);
      
      const analysis: EmotionalAnalysis = {
        id: `emotion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content_type: contentType,
        content,
        analysis_type: analysisType,
        result,
        confidence: this.calculateEmotionalConfidence(result),
        processing_time: Date.now() - startTime,
        created_at: new Date()
      };

      await this.saveEmotionalAnalysis(analysis);
      return analysis;

    } catch (error) {
      console.error('Emotional analysis failed:', error);
      throw error;
    }
  }

  private async performEmotionalAnalysis(
    content: string,
    contentType: EmotionalAnalysis['content_type'],
    analysisType: EmotionalAnalysis['analysis_type']
  ): Promise<EmotionalResult> {
    const prompt = `
      You are an advanced emotional AI using CallMind/emotion detection technology. 
      Analyze the following ${contentType} content for ${analysisType}:
      
      Content: ${content}
      
      Please provide a comprehensive emotional analysis including:
      1. Primary emotion with intensity and confidence
      2. Secondary emotions if present
      3. Sentiment analysis (polarity, score, confidence)
      4. Personality traits if applicable
      5. Current mood state and trends
      6. Behavioral indicators
      7. Recommendations for response or intervention
      
      Format your response as a JSON object with the following structure:
      {
        "primary_emotion": {
          "emotion": "joy",
          "intensity": 0.8,
          "confidence": 0.9,
          "description": "Strong positive emotion with enthusiasm",
          "triggers": ["achievement", "positive feedback"]
        },
        "secondary_emotions": [
          {
            "emotion": "gratitude",
            "intensity": 0.6,
            "confidence": 0.8,
            "description": "Feeling thankful"
          }
        ],
        "sentiment": {
          "polarity": "positive",
          "score": 0.7,
          "confidence": 0.85,
          "aspects": [
            {
              "aspect": "achievement",
              "sentiment": "positive",
              "score": 0.8,
              "confidence": 0.9
            }
          ]
        },
        "personality_traits": [
          {
            "trait": "optimism",
            "score": 0.8,
            "confidence": 0.7,
            "description": "Tends to see positive outcomes"
          }
        ],
        "mood_state": {
          "current_mood": "upbeat",
          "mood_intensity": 0.7,
          "mood_trend": "stable",
          "factors": ["recent success", "positive environment"]
        },
        "behavioral_indicators": [
          {
            "behavior": "expressive",
            "intensity": 0.8,
            "frequency": 0.7,
            "interpretation": "Shows emotions openly"
          }
        ],
        "recommendations": [
          {
            "type": "response",
            "priority": "medium",
            "description": "Acknowledge positive emotions",
            "action": "Provide positive reinforcement",
            "expected_outcome": "Maintain positive engagement"
          }
        ]
      }
    `;

    const completion = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert emotional intelligence AI with advanced capabilities in emotion detection, sentiment analysis, and psychological profiling. Provide detailed, accurate emotional analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content || '';
    return this.parseEmotionalResponse(response);
  }

  private parseEmotionalResponse(response: string): EmotionalResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse emotional response:', error);
    }

    // Fallback response
    return {
      primary_emotion: {
        emotion: 'neutral',
        intensity: 0.5,
        confidence: 0.5,
        description: 'Unable to determine emotion'
      },
      sentiment: {
        polarity: 'neutral',
        score: 0,
        confidence: 0.5
      }
    };
  }

  async createEmotionalProfile(data: {
    name: string;
    user_id?: string;
    baseline_emotions: EmotionData[];
    personality_profile: PersonalityTrait[];
    communication_style: string;
  }): Promise<EmotionalProfile> {
    const profile: EmotionalProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: data.user_id,
      name: data.name,
      baseline_emotions: data.baseline_emotions,
      personality_profile: data.personality_profile,
      communication_style: data.communication_style,
      emotional_patterns: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.saveEmotionalProfile(profile);
    return profile;
  }

  async analyzeConversation(messages: Array<{
    sender: string;
    content: string;
    timestamp: Date;
  }>): Promise<EmotionalConversation> {
    const emotionalMessages: EmotionalMessage[] = [];
    const emotionalFlow: EmotionalFlow[] = [];
    let overallSentiment: SentimentData | null = null;

    // Analyze each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      try {
        const analysis = await this.analyzeEmotion(message.content, 'text', 'emotion_detection');
        
        const emotionalMessage: EmotionalMessage = {
          id: `msg_${i}`,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp,
          emotional_state: analysis.result.primary_emotion,
          sentiment: analysis.result.sentiment
        };

        emotionalMessages.push(emotionalMessage);

        // Track emotional flow between messages
        if (i > 0) {
          const prevMessage = emotionalMessages[i - 1];
          const flow: EmotionalFlow = {
            timestamp: message.timestamp,
            emotional_shift: {
              from: prevMessage.emotional_state,
              to: emotionalMessage.emotional_state
            },
            intensity_change: emotionalMessage.emotional_state.intensity - prevMessage.emotional_state.intensity
          };

          // Detect trigger for emotional shift
          if (Math.abs(flow.intensity_change) > 0.3) {
            flow.trigger = this.detectEmotionalTrigger(prevMessage.content, message.content);
          }

          emotionalFlow.push(flow);
        }

        // Aggregate overall sentiment
        if (!overallSentiment) {
          overallSentiment = { ...analysis.result.sentiment };
        } else {
          overallSentiment.score = (overallSentiment.score + analysis.result.sentiment.score) / 2;
          overallSentiment.confidence = (overallSentiment.confidence + analysis.result.sentiment.confidence) / 2;
        }

      } catch (error) {
        console.error(`Failed to analyze message ${i}:`, error);
      }
    }

    // Detect conflict points
    const conflictPoints = this.detectConflictPoints(emotionalMessages);

    // Generate resolution suggestions
    const resolutionSuggestions = conflictPoints.length > 0 ? 
      await this.generateResolutionSuggestions(conflictPoints, emotionalMessages) : [];

    const conversation: EmotionalConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participant_a: messages[0]?.sender || 'unknown',
      participant_b: messages.find(m => m.sender !== messages[0]?.sender)?.sender || 'unknown',
      messages: emotionalMessages,
      emotional_flow: emotionalFlow,
      overall_sentiment: overallSentiment || {
        polarity: 'neutral',
        score: 0,
        confidence: 0.5
      },
      conflict_points: conflictPoints,
      resolution_suggestions: resolutionSuggestions,
      created_at: new Date()
    };

    await this.saveEmotionalConversation(conversation);
    return conversation;
  }

  private detectEmotionalTrigger(prevContent: string, currentContent: string): string {
    const prompt = `
      Given the previous message and current message, identify what triggered the emotional shift:
      
      Previous: "${prevContent}"
      Current: "${currentContent}"
      
      What specific word, phrase, or concept in the current message likely triggered the emotional change?
      Provide a brief, specific trigger description.
    `;

    // Simple trigger detection - in production, use more sophisticated analysis
    const triggerWords = ['but', 'however', 'unfortunately', 'sadly', 'amazing', 'great', 'wonderful'];
    const foundTrigger = triggerWords.find(word => 
      currentContent.toLowerCase().includes(word) && !prevContent.toLowerCase().includes(word)
    );

    return foundTrigger || 'content shift';
  }

  private detectConflictPoints(messages: EmotionalMessage[]): ConflictPoint[] {
    const conflicts: ConflictPoint[] = [];

    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const prev = messages[i - 1];

      // Detect conflict based on negative emotions and sentiment shifts
      if (current.sentiment.polarity === 'negative' && current.sentiment.score < -0.5) {
        if (prev.sentiment.polarity !== 'negative' || prev.sentiment.score > -0.3) {
          conflicts.push({
            timestamp: current.timestamp,
            severity: current.sentiment.score < -0.7 ? 'high' : 'medium',
            participants: [current.sender, prev.sender],
            description: `Negative emotional shift detected in ${current.sender}'s message`,
            emotional_states: {
              [current.sender]: current.emotional_state,
              [prev.sender]: prev.emotional_state
            }
          });
        }
      }
    }

    return conflicts;
  }

  private async generateResolutionSuggestions(
    conflictPoints: ConflictPoint[], 
    messages: EmotionalMessage[]
  ): Promise<string[]> {
    const suggestions: string[] = [];

    for (const conflict of conflictPoints) {
      const prompt = `
        Given this conflict point in a conversation, suggest resolution strategies:
        
        Conflict: ${conflict.description}
        Severity: ${conflict.severity}
        Participants: ${conflict.participants.join(', ')}
        
        Recent messages:
        ${messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n')}
        
        Provide 1-2 specific, actionable suggestions for resolving this conflict.
      `;

      try {
        const completion = await this.zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert conflict resolution specialist. Provide practical, empathetic resolution strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 300
        });

        const response = completion.choices[0]?.message?.content || '';
        suggestions.push(response);
      } catch (error) {
        console.error('Failed to generate resolution suggestion:', error);
        suggestions.push('Practice active listening and empathy');
      }
    }

    return suggestions;
  }

  async generateEmotionalResponse(
    inputContent: string,
    targetEmotion: string,
    context?: {
      relationship?: string;
      situation?: string;
      previous_interactions?: string[];
    }
  ): Promise<string> {
    const prompt = `
      You are an emotional AI response generator. Generate a response that conveys the target emotion based on the input.
      
      Input Content: "${inputContent}"
      Target Emotion: ${targetEmotion}
      
      Context:
      - Relationship: ${context?.relationship || 'general'}
      - Situation: ${context?.situation || 'general conversation'}
      - Previous Interactions: ${context?.previous_interactions?.join('; ') || 'none'}
      
      Generate a natural, empathetic response that conveys ${targetEmotion} while being appropriate for the context.
      The response should be emotionally intelligent and contextually appropriate.
    `;

    const completion = await this.zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in emotional communication and empathy. Generate responses that are emotionally appropriate and contextually aware.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || '';
  }

  async trackEmotionalTrends(
    profileId: string,
    timeRange: 'day' | 'week' | 'month' | 'year'
  ): Promise<{
    trends: Array<{
      emotion: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      change_percentage: number;
      time_points: Array<{
        timestamp: Date;
        intensity: number;
      }>;
    }>;
    insights: string[];
    recommendations: string[];
  }> {
    // In production, this would query historical emotional analysis data
    const mockTrends = [
      {
        emotion: 'positive',
        trend: 'increasing' as const,
        change_percentage: 15,
        time_points: [
          { timestamp: new Date(), intensity: 0.7 },
          { timestamp: new Date(Date.now() - 86400000), intensity: 0.6 },
          { timestamp: new Date(Date.now() - 172800000), intensity: 0.5 }
        ]
      }
    ];

    const insights = [
      'Positive emotions have been trending upward over the past week',
      'Emotional stability has improved compared to last month'
    ];

    const recommendations = [
      'Continue activities that promote positive emotional states',
      'Monitor for potential emotional triggers that could disrupt positive trends'
    ];

    return {
      trends: mockTrends,
      insights,
      recommendations
    };
  }

  private calculateEmotionalConfidence(result: EmotionalResult): number {
    let confidence = 0.5;
    
    if (result.primary_emotion.confidence > 0.7) confidence += 0.2;
    if (result.sentiment.confidence > 0.7) confidence += 0.2;
    if (result.secondary_emotions && result.secondary_emotions.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private async saveEmotionalAnalysis(analysis: EmotionalAnalysis): Promise<void> {
    // In production, save to database
    console.log('Saving emotional analysis:', analysis);
  }

  private async saveEmotionalProfile(profile: EmotionalProfile): Promise<void> {
    // In production, save to database
    console.log('Saving emotional profile:', profile);
  }

  private async saveEmotionalConversation(conversation: EmotionalConversation): Promise<void> {
    // In production, save to database
    console.log('Saving emotional conversation:', conversation);
  }

  async getEmotionalAnalysis(id: string): Promise<EmotionalAnalysis | null> {
    // In production, retrieve from database
    return null;
  }

  async getEmotionalProfile(id: string): Promise<EmotionalProfile | null> {
    // In production, retrieve from database
    return null;
  }

  async getEmotionalConversation(id: string): Promise<EmotionalConversation | null> {
    // In production, retrieve from database
    return null;
  }

  async getEmotionalProfiles(): Promise<EmotionalProfile[]> {
    // In production, retrieve from database
    return [];
  }
}