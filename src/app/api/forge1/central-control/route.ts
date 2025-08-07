import { NextRequest, NextResponse } from 'next/server';
import { CentralControlService } from '@/forge1/central-control/service';

const centralControlService = new CentralControlService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'execute_task':
        const task = await centralControlService.executeTask(data);
        return NextResponse.json({ success: true, data: task });

      case 'create_workflow':
        const workflow = await centralControlService.createWorkflow(data);
        return NextResponse.json({ success: true, data: workflow });

      case 'execute_workflow':
        const { workflowId, triggerData } = data;
        const workflowResult = await centralControlService.executeWorkflow(workflowId, triggerData);
        return NextResponse.json({ success: true, data: workflowResult });

      case 'acknowledge_alert':
        const { alertId } = data;
        await centralControlService.acknowledgeAlert(alertId);
        return NextResponse.json({ success: true });

      case 'resolve_alert':
        const { alertId: resolveAlertId } = data;
        await centralControlService.resolveAlert(resolveAlertId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Central Control API error:', error);
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
      case 'get_system_status':
        const systemStatus = centralControlService.getSystemStatus();
        return NextResponse.json({ success: true, data: systemStatus });

      case 'get_system_health':
        const systemHealth = await centralControlService.getSystemHealth();
        return NextResponse.json({ success: true, data: systemHealth });

      case 'get_tasks':
        const tasks = centralControlService.getTasks();
        return NextResponse.json({ success: true, data: tasks });

      case 'get_workflows':
        const workflows = centralControlService.getWorkflows();
        return NextResponse.json({ success: true, data: workflows });

      case 'get_alerts':
        const alerts = centralControlService.getAlerts();
        return NextResponse.json({ success: true, data: alerts });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Central Control API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}