import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { dbService } from '@/lib/db-service';

// Mock user for now - in production, this would come from authentication
const MOCK_USER_EMAIL = 'mock@example.com';
const MOCK_USER_NAME = 'Mock User';

// Global variable to store the mock user ID
let mockUserId: string | null = null;

// Ensure mock user exists
async function ensureMockUser(): Promise<string> {
  try {
    if (mockUserId) {
      // Verify the user still exists
      const user = await dbService.getUserById(mockUserId);
      if (user) {
        return mockUserId;
      }
    }
    
    let user = await dbService.getUserByEmail(MOCK_USER_EMAIL);
    if (!user) {
      console.log('Creating new mock user...');
      user = await dbService.createUser(MOCK_USER_EMAIL, MOCK_USER_NAME);
      console.log('Created user with ID:', user.id);
    }
    mockUserId = user.id;
    console.log('Using user ID:', mockUserId);
    return user.id;
  } catch (error) {
    console.error('Error ensuring mock user exists:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure mock user exists and get the actual user ID
    const userId = await ensureMockUser();
    
    const body = await request.json();
    const { agentId, message, conversationId } = body;

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Agent ID and message are required' },
        { status: 400 }
      );
    }

    // Find the agent in the database
    const agent = await dbService.getAgentById(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent is ready or deployed
    if (agent.status !== 'ready' && agent.status !== 'deployed') {
      return NextResponse.json(
        { error: `Agent is not ready for testing. Current status: ${agent.status}` },
        { status: 400 }
      );
    }

    // Create system prompt based on agent's role and capabilities
    const systemPrompt = `You are a ${agent.role}. Your capabilities include: ${agent.capabilities.join(', ')}. 
    You have access to the following tools: ${agent.config.tools.join(', ')}.
    Please provide professional, accurate, and helpful responses based on your specialized expertise.
    Your personality should be professional but approachable, with a temperature setting of ${agent.config.temperature} for creativity level.`;

    const startTime = Date.now();

    try {
      // Use real AI service
      const aiResponse = await aiService.generateWithTools(
        message,
        {
          model: agent.config.model,
          temperature: agent.config.temperature,
          maxTokens: agent.config.max_tokens,
          systemPrompt
        },
        agent.config.tools
      );

      const processingTime = Date.now() - startTime;

      // Log conversation
      const conversationMessages = [
        {
          id: Date.now().toString(),
          type: 'user' as const,
          content: message,
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'agent' as const,
          content: aiResponse.content,
          timestamp: new Date()
        }
      ];

      let finalConversationId = conversationId;

      if (conversationId) {
        // Update existing conversation
        await dbService.updateConversation(conversationId, conversationMessages);
      } else {
        // Create new conversation
        const newConversation = await dbService.createConversation(
          agentId,
          userId,
          conversationMessages,
          `Conversation with ${agent.name}`
        );
        finalConversationId = newConversation.id;
      }

      // Log analytics
      await dbService.createAnalytics(
        'agent_tested',
        { 
          agentId, 
          agentName: agent.name, 
          conversationId: finalConversationId,
          messageLength: message.length,
          responseLength: aiResponse.content.length
        },
        {
          processingTime,
          model: agent.config.model,
          toolsUsed: agent.config.tools.length,
          tokensUsed: aiResponse.usage?.total_tokens || 0
        },
        userId,
        agentId,
        processingTime
      );

      return NextResponse.json({
        success: true,
        response: aiResponse.content,
        agent: {
          id: agent.id,
          name: agent.name,
          status: agent.status,
          performance: agent.performance
        },
        processingTime: aiResponse.processingTime,
        usage: aiResponse.usage,
        model: aiResponse.model,
        conversationId: finalConversationId
      });

    } catch (aiError) {
      console.error('AI Service error:', aiError);
      
      // Fallback to simulated response if AI service fails
      const capabilities = agent.capabilities.join(', ');
      const fallbackResponse = `As your ${agent.role}, I can help you with ${capabilities}. 

Regarding your question about "${message}", I would typically:

1. Analyze the request using my ${agent.config.model} model
2. Apply my specialized capabilities in ${agent.capabilities.slice(0, 3).join(', ')}
3. Use available tools like ${agent.config.tools.slice(0, 3).join(', ')} if needed
4. Provide a comprehensive response with ${Math.round(agent.performance.accuracy * 100)}% accuracy

Note: The AI service is currently unavailable. This is a simulated response.`;

      const processingTime = Date.now() - startTime;

      // Log fallback analytics
      await dbService.createAnalytics(
        'agent_tested_fallback',
        { 
          agentId, 
          agentName: agent.name,
          error: aiError instanceof Error ? aiError.message : 'Unknown error'
        },
        { processingTime, fallback: true },
        userId,
        agentId,
        processingTime
      );

      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        agent: {
          id: agent.id,
          name: agent.name,
          status: agent.status,
          performance: agent.performance
        },
        processingTime,
        warning: 'AI service unavailable, using fallback response'
      });
    }

  } catch (error) {
    console.error('Error testing agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}