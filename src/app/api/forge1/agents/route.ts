import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    // Ensure mock user exists and get the actual user ID
    const userId = await ensureMockUser();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    if (agentId) {
      // Return specific agent
      const agent = await dbService.getAgentById(agentId);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ agent });
    }

    // Return all agents for the user
    const agents = await dbService.getAgentsByUserId(userId);
    return NextResponse.json({
      agents,
      total: agents.length
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure mock user exists and get the actual user ID
    const userId = await ensureMockUser();
    
    const body = await request.json();
    const { action, agentId, data } = body;

    switch (action) {
      case 'create_agent':
        if (!data) {
          return NextResponse.json(
            { error: 'Agent data is required' },
            { status: 400 }
          );
        }

        // Transform the form data to match database structure
        const transformedData = {
          ...data,
          // Transform memory config from form format to database format
          config: {
            ...data.config,
            memory_config: {
              short_term: data.config.memory_config.shortTerm || data.config.memory_config.short_term,
              long_term: data.config.memory_config.longTerm || data.config.memory_config.long_term,
              context_window: data.config.memory_config.workingMemory || data.config.memory_config.context_window || 8,
              episodic: data.config.memory_config.episodic || false,
              semantic: data.config.memory_config.semantic || false,
              working_memory: data.config.memory_config.workingMemory || 8,
              retention: data.config.memory_config.retention || 0.8
            },
            // Handle advanced configuration fields if they exist
            ...(data.config.voice_config && { voice_config: data.config.voice_config }),
            ...(data.config.emotional_config && { emotional_config: data.config.emotional_config }),
            ...(data.config.appearance_config && { appearance_config: data.config.appearance_config }),
            ...(data.config.communication_style && { communication_style: data.config.communication_style }),
            ...(data.config.response_style && { response_style: data.config.response_style }),
            ...(data.config.creativity !== undefined && { creativity: data.config.creativity }),
            ...(data.config.analytical !== undefined && { analytical: data.config.analytical }),
            ...(data.config.autonomy !== undefined && { autonomy: data.config.autonomy }),
            ...(data.config.enable_proactive !== undefined && { enable_proactive: data.config.enable_proactive }),
            ...(data.config.enable_memory !== undefined && { enable_memory: data.config.enable_memory }),
            ...(data.config.enable_learning !== undefined && { enable_learning: data.config.enable_learning }),
            ...(data.config.enable_emotional !== undefined && { enable_emotional: data.config.enable_emotional }),
            ...(data.config.enable_multimodal !== undefined && { enable_multimodal: data.config.enable_multimodal }),
            ...(data.config.learning_rate !== undefined && { learning_rate: data.config.learning_rate }),
            ...(data.config.adaptation_speed !== undefined && { adaptation_speed: data.config.adaptation_speed })
          },
          status: data.status || 'training', // Default status if not provided
          userId: userId
        };

        const newAgent = await dbService.createAgent(transformedData);

        // Log analytics
        await dbService.createAnalytics(
          'agent_created',
          { agentId: newAgent.id, agentName: data.name },
          { capabilities: data.capabilities.length, tools: data.config.tools.length },
          userId,
          newAgent.id
        );

        return NextResponse.json({
          success: true,
          agent: await dbService.getAgentById(newAgent.id)
        });

      case 'update_agent':
        if (!agentId || !data) {
          return NextResponse.json(
            { error: 'Agent ID and data are required' },
            { status: 400 }
          );
        }

        const existingAgent = await dbService.getAgentById(agentId);
        if (!existingAgent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        const updatedAgent = await dbService.updateAgent(agentId, data);

        // Log analytics
        await dbService.createAnalytics(
          'agent_updated',
          { agentId, changes: Object.keys(data) },
          { updateFields: Object.keys(data).length },
          userId,
          agentId
        );

        return NextResponse.json({
          success: true,
          agent: updatedAgent
        });

      case 'deploy_agent':
        if (!agentId) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }

        const deployAgent = await dbService.getAgentById(agentId);
        if (!deployAgent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        if (deployAgent.status !== 'ready') {
          return NextResponse.json(
            { error: 'Agent must be in ready status to deploy' },
            { status: 400 }
          );
        }

        const deployedAgent = await dbService.updateAgent(agentId, { status: 'deployed' });

        // Log analytics
        await dbService.createAnalytics(
          'agent_deployed',
          { agentId, agentName: deployAgent.name },
          { status: 'deployed' },
          userId,
          agentId
        );

        return NextResponse.json({
          success: true,
          agent: deployedAgent
        });

      case 'train_agent':
        if (!agentId) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }

        const trainAgent = await dbService.getAgentById(agentId);
        if (!trainAgent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        if (trainAgent.status !== 'training') {
          return NextResponse.json(
            { error: 'Agent must be in training status to train' },
            { status: 400 }
          );
        }

        // Simulate training process
        // In a real system, this would involve actual model training
        const trainingDuration = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
        
        // Simulate training delay
        await new Promise(resolve => setTimeout(resolve, trainingDuration));

        // Update agent status to ready
        const trainedAgent = await dbService.updateAgent(agentId, { 
          status: 'ready',
          performance: {
            ...trainAgent.performance,
            accuracy: Math.min(0.95, trainAgent.performance.accuracy + 0.05),
            speed: Math.min(0.95, trainAgent.performance.speed + 0.03),
            reliability: Math.min(0.95, trainAgent.performance.reliability + 0.04)
          }
        });

        // Log analytics
        await dbService.createAnalytics(
          'agent_trained',
          { agentId, agentName: trainAgent.name, trainingDuration },
          { status: 'ready', performance_improvement: true },
          userId,
          agentId,
          trainingDuration
        );

        return NextResponse.json({
          success: true,
          agent: trainedAgent,
          trainingDuration
        });

      case 'delete_agent':
        if (!agentId) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }

        const deleteAgent = await dbService.getAgentById(agentId);
        if (!deleteAgent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        const deleted = await dbService.deleteAgent(agentId);
        if (!deleted) {
          return NextResponse.json(
            { error: 'Failed to delete agent' },
            { status: 500 }
          );
        }

        // Log analytics
        await dbService.createAnalytics(
          'agent_deleted',
          { agentId, agentName: deleteAgent.name },
          { status: 'deleted' },
          userId,
          agentId
        );

        return NextResponse.json({
          success: true,
          deletedAgent: deleteAgent
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}