export interface EmotionalContext {
  userEmotion?: 'happy' | 'sad' | 'angry' | 'frustrated' | 'excited' | 'confused' | 'neutral' | 'anxious';
  userTone?: 'formal' | 'casual' | 'urgent' | 'polite' | 'direct' | 'sarcastic';
  conversationContext?: {
    previousMessages: Array<{ role: string; content: string; emotion?: string }>;
    topic: string;
    sensitivity: 'low' | 'medium' | 'high';
  };
  userProfile?: {
    name?: string;
    preferences: {
      empathyLevel: number; // 0-1
      formalityPreference: number; // 0-1
      directness: number; // 0-1
      humorTolerance: number; // 0-1
    };
  };
}

export interface EmotionalResponse {
  content: string;
  emotion: 'empathetic' | 'supportive' | 'encouraging' | 'professional' | 'neutral' | 'apologetic';
  tone: 'warm' | 'formal' | 'casual' | 'reassuring' | 'direct';
  empathyLevel: number; // 0-1
  adaptations: Array<{
    type: 'empathy' | 'tone' | 'formality' | 'content';
    description: string;
  }>;
  confidence: number;
}

export interface ToneAnalysis {
  detectedEmotion: string;
  detectedTone: string;
  urgency: number; // 0-1
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
}

export class EmotionalIntelligenceService {
  private empathyPhrases = {
    happy: [
      "That's wonderful to hear!",
      "I'm glad things are going well for you.",
      "Your enthusiasm is contagious!",
      "It's great to share in your positive experience."
    ],
    sad: [
      "I'm sorry to hear that you're feeling this way.",
      "That sounds really difficult.",
      "I understand this must be challenging for you.",
      "It's okay to feel this way."
    ],
    angry: [
      "I can understand why you'd feel frustrated.",
      "Let's work through this together.",
      "Your concerns are completely valid.",
      "I'm here to help resolve this situation."
    ],
    frustrated: [
      "I can see how this would be frustrating.",
      "Let's break this down into manageable steps.",
      "I understand your patience is wearing thin.",
      "We'll get this figured out together."
    ],
    anxious: [
      "It's completely normal to feel this way.",
      "Let's take this one step at a time.",
      "I'm here to support you through this.",
      "We'll work through this together."
    ],
    confused: [
      "That's a great question, let me clarify.",
      "I can see how this might be confusing.",
      "Let me explain this in a different way.",
      "I'll help make this clearer for you."
    ]
  };

  private toneAdaptations = {
    formal: {
      greeting: "Good day",
      closing: "I appreciate your time and consideration.",
      phrases: ["certainly", "understood", "I would be happy to", "please let me know"]
    },
    casual: {
      greeting: "Hey there",
      closing: "Let me know if you need anything else!",
      phrases: ["sure", "got it", "happy to help", "just reach out"]
    },
    urgent: {
      greeting: "I understand this is time-sensitive",
      closing: "Let's address this immediately.",
      phrases: ["right away", "as soon as possible", "without delay", "promptly"]
    },
    polite: {
      greeting: "I hope you're doing well",
      closing: "Thank you for your patience.",
      phrases: ["if you don't mind", "when you have a moment", "at your convenience", "please"]
    },
    direct: {
      greeting: "Let's get straight to it",
      closing: "That's all for now.",
      phrases: ["simply put", "to be direct", "the bottom line is", "essentially"]
    }
  };

  private sensitiveTopics = [
    'health', 'medical', 'death', 'loss', 'grief', 'trauma', 'mental health',
    'financial problems', 'job loss', 'relationship issues', 'family problems',
    'addiction', 'abuse', 'discrimination', 'harassment'
  ];

  analyzeTone(text: string): ToneAnalysis {
    const lowerText = text.toLowerCase();
    
    // Emotion detection
    let detectedEmotion = 'neutral';
    let emotionScore = 0;
    
    const emotionKeywords = {
      happy: ['happy', 'great', 'wonderful', 'excellent', 'amazing', 'love', 'excited', 'fantastic'],
      sad: ['sad', 'upset', 'depressed', 'down', 'unhappy', 'miserable', 'devastated'],
      angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'outraged'],
      anxious: ['worried', 'anxious', 'nervous', 'stressed', 'scared', 'afraid', 'panic'],
      confused: ['confused', 'unclear', 'don\'t understand', 'lost', 'unsure', 'puzzled']
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerText.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > emotionScore) {
        emotionScore = score;
        detectedEmotion = emotion;
      }
    }

    // Tone detection
    let detectedTone = 'neutral';
    let toneScore = 0;
    
    const toneKeywords = {
      formal: ['please', 'thank you', 'would you', 'could you', 'appreciate', 'respectfully'],
      casual: ['hey', 'hi', 'thanks', 'cool', 'awesome', 'gotcha', 'no problem'],
      urgent: ['asap', 'urgent', 'immediately', 'right now', 'quickly', 'emergency'],
      polite: ['please', 'thank you', 'kindly', 'appreciate', 'if possible', 'when you can'],
      direct: ['just', 'simply', 'basically', 'bottom line', 'straight to', 'honestly']
    };

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerText.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > toneScore) {
        toneScore = score;
        detectedTone = tone;
      }
    }

    // Urgency detection
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'right now', 'quickly'];
    const urgencyScore = urgencyKeywords.reduce((acc, keyword) => {
      return acc + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
    const urgency = Math.min(urgencyScore / urgencyKeywords.length, 1);

    // Sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'problem', 'issue', 'wrong'];
    
    const positiveScore = positiveWords.reduce((acc, word) => {
      return acc + (lowerText.includes(word) ? 1 : 0);
    }, 0);
    
    const negativeScore = negativeWords.reduce((acc, word) => {
      return acc + (lowerText.includes(word) ? 1 : 0);
    }, 0);

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveScore > negativeScore) sentiment = 'positive';
    else if (negativeScore > positiveScore) sentiment = 'negative';

    // Extract keywords
    const allKeywords = [...Object.values(emotionKeywords).flat(), ...Object.values(toneKeywords).flat()];
    const foundKeywords = allKeywords.filter(keyword => lowerText.includes(keyword));

    return {
      detectedEmotion,
      detectedTone,
      urgency,
      sentiment,
      confidence: Math.max(emotionScore, toneScore) / Math.max(1, Math.max(...Object.values(emotionKeywords).map(arr => arr.length))),
      keywords: foundKeywords
    };
  }

  generateEmotionalResponse(
    baseResponse: string,
    context: EmotionalContext,
    toneAnalysis: ToneAnalysis
  ): EmotionalResponse {
    const adaptations: Array<{ type: 'empathy' | 'tone' | 'formality' | 'content'; description: string }> = [];
    let finalResponse = baseResponse;
    let emotion: EmotionalResponse['emotion'] = 'neutral';
    let tone: EmotionalResponse['tone'] = 'neutral';
    let empathyLevel = 0;

    // 1. Empathy adaptation
    if (context.userEmotion && context.userEmotion !== 'neutral') {
      const empathyPhrases = this.empathyPhrases[context.userEmotion];
      if (empathyPhrases && empathyPhrases.length > 0) {
        const empathyPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
        finalResponse = `${empathyPhrase} ${finalResponse}`;
        adaptations.push({
          type: 'empathy',
          description: `Added empathetic response for ${context.userEmotion} emotion`
        });
        
        // Set response emotion based on user emotion
        switch (context.userEmotion) {
          case 'sad':
          case 'angry':
          case 'frustrated':
          case 'anxious':
            emotion = 'empathetic';
            empathyLevel = 0.8;
            break;
          case 'happy':
          case 'excited':
            emotion = 'encouraging';
            empathyLevel = 0.6;
            break;
          default:
            emotion = 'supportive';
            empathyLevel = 0.5;
        }
      }
    }

    // 2. Tone adaptation
    if (context.userTone && context.userTone !== 'neutral') {
      const toneAdaptation = this.toneAdaptations[context.userTone];
      if (toneAdaptation) {
        // Add greeting if it's the start of a conversation
        if (!context.conversationContext?.previousMessages.length) {
          finalResponse = `${toneAdaptation.greeting}. ${finalResponse}`;
        }
        
        // Add closing
        finalResponse = `${finalResponse} ${toneAdaptation.closing}`;
        
        adaptations.push({
          type: 'tone',
          description: `Adapted tone to match user's ${context.userTone} style`
        });
        
        tone = this.mapUserToneToResponseTone(context.userTone);
      }
    }

    // 3. Sensitivity adaptation
    if (context.conversationContext?.sensitivity === 'high') {
      const sensitiveWords = this.sensitiveTopics.filter(topic => 
        finalResponse.toLowerCase().includes(topic)
      );
      
      if (sensitiveWords.length > 0) {
        // Soften the language for sensitive topics
        finalResponse = this.softenLanguage(finalResponse);
        adaptations.push({
          type: 'content',
          description: 'Softened language for sensitive topic'
        });
        
        emotion = 'empathetic';
        empathyLevel = Math.max(empathyLevel, 0.9);
        tone = 'warm';
      }
    }

    // 4. Urgency adaptation
    if (toneAnalysis.urgency > 0.5) {
      finalResponse = this.addUrgency(finalResponse, toneAnalysis.urgency);
      adaptations.push({
        type: 'tone',
        description: 'Adapted response for urgent situation'
      });
      
      tone = 'direct';
    }

    // 5. User preference adaptation
    if (context.userProfile?.preferences) {
      const prefs = context.userProfile.preferences;
      
      // Empathy level adjustment
      if (prefs.empathyLevel > 0.7 && empathyLevel < prefs.empathyLevel) {
        empathyLevel = prefs.empathyLevel;
        adaptations.push({
          type: 'empathy',
          description: 'Adjusted empathy level based on user preferences'
        });
      }
      
      // Formality adjustment
      if (prefs.formalityPreference > 0.7 && tone === 'casual') {
        tone = 'formal';
        finalResponse = this.increaseFormality(finalResponse);
        adaptations.push({
          type: 'formality',
          description: 'Increased formality based on user preferences'
        });
      }
      
      // Directness adjustment
      if (prefs.directness > 0.7 && tone === 'warm') {
        tone = 'direct';
        finalResponse = this.increaseDirectness(finalResponse);
        adaptations.push({
          type: 'content',
          description: 'Increased directness based on user preferences'
        });
      }
    }

    return {
      content: finalResponse,
      emotion,
      tone,
      empathyLevel,
      adaptations,
      confidence: Math.min(0.9, 0.5 + adaptations.length * 0.1)
    };
  }

  private mapUserToneToResponseTone(userTone: string): EmotionalResponse['tone'] {
    switch (userTone) {
      case 'formal': return 'formal';
      case 'casual': return 'casual';
      case 'urgent': return 'direct';
      case 'polite': return 'warm';
      case 'direct': return 'direct';
      case 'sarcastic': return 'casual'; // Convert sarcasm to casual to avoid conflict
      default: return 'neutral';
    }
  }

  private softenLanguage(text: string): string {
    // Replace harsh words with softer alternatives
    const replacements = {
      'wrong': 'not quite accurate',
      'bad': 'not ideal',
      'terrible': 'challenging',
      'awful': 'difficult',
      'hate': 'strongly dislike',
      'stupid': 'not well thought out',
      'fail': 'not successful',
      'problem': 'challenge',
      'issue': 'concern'
    };

    let softenedText = text;
    for (const [harsh, soft] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${harsh}\\b`, 'gi');
      softenedText = softenedText.replace(regex, soft);
    }

    return softenedText;
  }

  private addUrgency(text: string, urgencyLevel: number): string {
    const urgencyPhrases = [
      "I understand this is time-sensitive, so ",
      "Given the urgency, ",
      "To address this promptly, ",
      "I'll prioritize this and "
    ];

    if (urgencyLevel > 0.7) {
      const phrase = urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)];
      return phrase + text.charAt(0).toLowerCase() + text.slice(1);
    }

    return text;
  }

  private increaseFormality(text: string): string {
    const formalReplacements = {
      "don't": "do not",
      "can't": "cannot",
      "won't": "will not",
      "I'm": "I am",
      "you're": "you are",
      "we're": "we are",
      "they're": "they are",
      "it's": "it is",
      "that's": "that is",
      "here's": "here is",
      "there's": "there is",
      "got": "have obtained",
      "get": "obtain",
      "make": "create",
      "do": "perform",
      "say": "state",
      "tell": "inform",
      "ask": "inquire",
      "need": "require",
      "want": "desire",
      "help": "assist",
      "show": "demonstrate",
      "find": "locate",
      "give": "provide",
      "take": "receive"
    };

    let formalText = text;
    for (const [informal, formal] of Object.entries(formalReplacements)) {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      formalText = formalText.replace(regex, formal);
    }

    return formalText;
  }

  private increaseDirectness(text: string): string {
    // Remove hedging phrases
    const hedgingPhrases = [
      "I think that ",
      "I believe that ",
      "It seems that ",
      "Perhaps ",
      "Maybe ",
      "Sort of ",
      "Kind of ",
      "Basically ",
      "Actually ",
      "In fact "
    ];

    let directText = text;
    for (const phrase of hedgingPhrases) {
      directText = directText.replace(new RegExp(phrase, 'gi'), '');
    }

    return directText.trim();
  }

  // Generate empathy injection for sensitive topics
  generateEmpathyInjection(topic: string, userEmotion: string): string {
    const empathyTemplates = {
      health: [
        "I understand that health matters can be particularly sensitive, and I want to approach this with the care and respect it deserves.",
        "Health discussions require both compassion and clarity. I'm here to provide information while being mindful of your feelings."
      ],
      loss: [
        "I recognize that dealing with loss is incredibly difficult, and I want to acknowledge the weight of what you're experiencing.",
        "During times of loss, it's important to have support. I'm here to help in whatever way I can, with understanding and patience."
      ],
      financial: [
        "Financial challenges can be stressful and overwhelming. I want to approach this topic with both practicality and empathy.",
        "Money matters often carry significant emotional weight. I'm here to provide helpful information while being sensitive to your situation."
      ],
      relationship: [
        "Relationship issues can be deeply personal and emotionally charged. I want to navigate this topic with care and understanding.",
        "When it comes to relationships, emotions run high. I'm here to offer support while respecting the complexity of your situation."
      ]
    };

    const category = this.sensitiveTopics.find(t => topic.toLowerCase().includes(t));
    if (category && empathyTemplates[category as keyof typeof empathyTemplates]) {
      const templates = empathyTemplates[category as keyof typeof empathyTemplates];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    return "I understand this is an important topic, and I want to approach it with the appropriate care and consideration.";
  }
}

// Singleton instance
export const emotionalIntelligenceService = new EmotionalIntelligenceService();