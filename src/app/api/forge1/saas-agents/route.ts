import { NextRequest, NextResponse } from 'next/server';
import { SaaSAgentsService } from '@/forge1/saas-agents/service';

const saasAgentsService = new SaaSAgentsService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'create_agent':
        const agent = await saasAgentsService.createSaaSAgent(data);
        return NextResponse.json({ success: true, data: agent });

      case 'execute_task':
        const { taskId, inputData } = data;
        const task = await saasAgentsService.getSaaSTask(taskId);
        if (!task) {
          return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
        }
        const executedTask = await saasAgentsService.executeTask(task, inputData);
        return NextResponse.json({ success: true, data: executedTask });

      case 'create_task':
        const newTask = await saasAgentsService.createSaaSTask(data);
        return NextResponse.json({ success: true, data: newTask });

      case 'create_workflow':
        const workflow = await saasAgentsService.createSaaSWorkflow(data);
        return NextResponse.json({ success: true, data: workflow });

      case 'execute_workflow':
        const { workflowId, triggerData } = data;
        const workflowToExecute = await saasAgentsService.getSaaSWorkflow(workflowId);
        if (!workflowToExecute) {
          return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
        }
        const workflowResult = await saasAgentsService.executeWorkflow(workflowToExecute, triggerData);
        return NextResponse.json({ success: true, data: workflowResult });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SaaS Agents API error:', error);
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
        const agent = await saasAgentsService.getSaaSAgent(agentId);
        return NextResponse.json({ success: true, data: agent });

      case 'get_task':
        const taskId = searchParams.get('id');
        if (!taskId) {
          return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
        }
        const task = await saasAgentsService.getSaaSTask(taskId);
        return NextResponse.json({ success: true, data: task });

      case 'get_workflow':
        const workflowId = searchParams.get('id');
        if (!workflowId) {
          return NextResponse.json({ success: false, error: 'Workflow ID required' }, { status: 400 });
        }
        const workflow = await saasAgentsService.getSaaSWorkflow(workflowId);
        return NextResponse.json({ success: true, data: workflow });

      case 'get_agents':
        const agents = await saasAgentsService.getSaaSAgents();
        return NextResponse.json({ success: true, data: agents });

      case 'get_tasks':
        const agentIdFilter = searchParams.get('agentId');
        const tasks = await saasAgentsService.getSaaSTasks(agentIdFilter || undefined);
        return NextResponse.json({ success: true, data: tasks });

      case 'get_workflows':
        const workflows = await saasAgentsService.getSaaSWorkflows();
        return NextResponse.json({ success: true, data: workflows });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('SaaS Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}