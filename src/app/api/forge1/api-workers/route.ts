import { NextRequest, NextResponse } from 'next/server';
import { APIWorkerService } from '@/forge1/api-workers/service';

const apiWorkerService = new APIWorkerService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'create_agent':
        const agent = await apiWorkerService.createAgent(data);
        return NextResponse.json({ success: true, data: agent });

      case 'execute_agent':
        const { agentId, inputData } = data;
        const session = await apiWorkerService.executeAgent(agentId, inputData);
        return NextResponse.json({ success: true, data: session });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Workers API error:', error);
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
        const agent = await apiWorkerService.getAgent(agentId);
        return NextResponse.json({ success: true, data: agent });

      case 'get_session':
        const sessionId = searchParams.get('id');
        if (!sessionId) {
          return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }
        const session = await apiWorkerService.getExecutionSession(sessionId);
        return NextResponse.json({ success: true, data: session });

      case 'get_agents':
        const agents = await apiWorkerService.getAgents();
        return NextResponse.json({ success: true, data: agents });

      case 'get_sessions':
        const agentIdFilter = searchParams.get('agentId');
        const sessions = await apiWorkerService.getExecutionSessions(agentIdFilter || undefined);
        return NextResponse.json({ success: true, data: sessions });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Workers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}