import { NextRequest, NextResponse } from 'next/server';
import { WorldModelingService } from '@/forge1/world-modeling/service';

const worldModelingService = new WorldModelingService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'create_world_model':
        const worldModel = await worldModelingService.createWorldModel(data);
        return NextResponse.json({ success: true, data: worldModel });

      case 'generate_plan':
        const { worldModelId, objective, method } = data;
        const worldModel = await worldModelingService.getWorldModel(worldModelId);
        if (!worldModel) {
          return NextResponse.json({ success: false, error: 'World model not found' }, { status: 404 });
        }
        const plan = await worldModelingService.generatePlan(worldModel, objective, method);
        return NextResponse.json({ success: true, data: plan });

      case 'execute_plan':
        const { sessionId } = data;
        const session = await worldModelingService.getPlanningSession(sessionId);
        if (!session) {
          return NextResponse.json({ success: false, error: 'Planning session not found' }, { status: 404 });
        }
        await worldModelingService.executePlan(session);
        return NextResponse.json({ success: true, data: session });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('World modeling API error:', error);
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
      case 'get_world_model':
        const modelId = searchParams.get('id');
        if (!modelId) {
          return NextResponse.json({ success: false, error: 'Model ID required' }, { status: 400 });
        }
        const model = await worldModelingService.getWorldModel(modelId);
        return NextResponse.json({ success: true, data: model });

      case 'get_planning_session':
        const sessionId = searchParams.get('id');
        if (!sessionId) {
          return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
        }
        const session = await worldModelingService.getPlanningSession(sessionId);
        return NextResponse.json({ success: true, data: session });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('World modeling API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}