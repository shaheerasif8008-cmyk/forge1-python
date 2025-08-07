import { NextRequest, NextResponse } from 'next/server';
import { SpatialAgentsService } from '@/forge1/spatial/service';

const spatialAgentsService = new SpatialAgentsService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'create_agent':
        const agent = await spatialAgentsService.createSpatialAgent(data);
        return NextResponse.json({ success: true, data: agent });

      case 'create_environment':
        const environment = await spatialAgentsService.createSpatialEnvironment(data);
        return NextResponse.json({ success: true, data: environment });

      case 'start_session':
        const session = await spatialAgentsService.startXRSession(data);
        return NextResponse.json({ success: true, data: session });

      case 'process_interaction':
        const { sessionId, interaction } = data;
        const processedInteraction = await spatialAgentsService.processSpatialInteraction(sessionId, interaction);
        return NextResponse.json({ success: true, data: processedInteraction });

      case 'create_task':
        const task = await spatialAgentsService.createSpatialTask(data);
        return NextResponse.json({ success: true, data: task });

      case 'generate_guidance':
        const { environmentId, userPosition, targetPosition, obstacles } = data;
        const guidance = await spatialAgentsService.generateSpatialGuidance(environmentId, userPosition, targetPosition, obstacles);
        return NextResponse.json({ success: true, data: guidance });

      case 'analyze_behavior':
        const { sessionId: behaviorSessionId, timeRange } = data;
        const behaviorAnalysis = await spatialAgentsService.analyzeSpatialBehavior(behaviorSessionId, timeRange);
        return NextResponse.json({ success: true, data: behaviorAnalysis });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Spatial Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get_agent':
        const agentId = searchParams.get('id');
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID required' }, { status: 400 });
        }
        const agent = await spatialAgentsService.getSpatialAgent(agentId);
        return NextResponse.json({ success: true, data: agent });

      case 'get_environment':
        const environmentId = searchParams.get('id');
        if (!environmentId) {
          return NextResponse.json({ success: false, error: 'Environment ID required' }, { status: 400 });
        }
        const environment = await spatialAgentsService.getSpatialEnvironment(environmentId);
        return NextResponse.json({ success: true, data: environment });

      case 'get_session':
        const sessionId = searchParams.get('id');
        if (!sessionId) {
          return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }
        const session = await spatialAgentsService.getXRSession(sessionId);
        return NextResponse.json({ success: true, data: session });

      case 'get_task':
        const taskId = searchParams.get('id');
        if (!taskId) {
          return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
        }
        const task = await spatialAgentsService.getSpatialTask(taskId);
        return NextResponse.json({ success: true, data: task });

      case 'get_agents':
        const agents = await spatialAgentsService.getSpatialAgents();
        return NextResponse.json({ success: true, data: agents });

      case 'get_environments':
        const environments = await spatialAgentsService.getSpatialEnvironments();
        return NextResponse.json({ success: true, data: environments });

      case 'get_sessions':
        const agentIdFilter = searchParams.get('agentId');
        const sessions = await spatialAgentsService.getXRSessions(agentIdFilter || undefined);
        return NextResponse.json({ success: true, data: sessions });

      case 'get_tasks':
        const taskAgentIdFilter = searchParams.get('agentId');
        const tasks = await spatialAgentsService.getSpatialTasks(taskAgentIdFilter || undefined);
        return NextResponse.json({ success: true, data: tasks });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Spatial Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}