import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const agentLayer = FORGE1_CONFIG.layers.find(l => l.id === 'agent');
    if (!agentLayer) {
      return NextResponse.json(
        { error: 'Agent layer not found' },
        { status: 404 }
      );
    }

    if (action === 'status') {
      return NextResponse.json({
        layer: agentLayer,
        active_agents: FORGE1_CONFIG.agents.filter(a => a.status === 'deployed').length,
        total_agents: FORGE1_CONFIG.agents.length,
        system_load: Math.random() * 0.8 + 0.1,
        reasoning_engine: 'AutoGen',
        orchestration_status: 'active'
      });
    }

    if (action === 'agents') {
      return NextResponse.json({
        agents: FORGE1_CONFIG.agents,
        summary: {
          total: FORGE1_CONFIG.agents.length,
          deployed: FORGE1_CONFIG.agents.filter(a => a.status === 'deployed').length,
          training: FORGE1_CONFIG.agents.filter(a => a.status === 'training').length,
          ready: FORGE1_CONFIG.agents.filter(a => a.status === 'ready').length
        }
      });
    }

    if (action === 'orchestration') {
      return NextResponse.json({
        orchestration_status: 'active',
        active_workflows: Math.floor(Math.random() * 10) + 1,
        completed_workflows: Math.floor(Math.random() * 100) + 50,
        failed_workflows: Math.floor(Math.random() * 5),
        avg_workflow_duration: Math.floor(Math.random() * 300) + 60
      });
    }

    // Default response
    return NextResponse.json({
      layer: agentLayer,
      message: 'Agent Logic layer is running',
      capabilities: [
        'Multi-agent orchestration',
        'Dynamic reasoning',
        'Task decomposition',
        'Agent collaboration',
        'Autonomous decision making'
      ]
    });

  } catch (error) {
    console.error('Error in Agent Logic API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_agent_workflow':
        // Simulate creating a new agent workflow
        const workflow = {
          workflow_id: `workflow-${Date.now()}`,
          name: data?.name || 'Untitled Workflow',
          description: data?.description || 'Auto-generated workflow',
          agents: data?.agents || [],
          tasks: data?.tasks || [],
          status: 'created',
          created_at: new Date().toISOString(),
          estimated_duration: Math.floor(Math.random() * 3600) + 300
        };
        
        return NextResponse.json({
          success: true,
          workflow: workflow
        });

      case 'execute_reasoning':
        // Simulate reasoning execution
        const reasoning = {
          reasoning_id: `reasoning-${Date.now()}`,
          input: data?.input || '',
          output: `Reasoning result for: ${data?.input || 'unknown input'}`,
          confidence: Math.random() * 0.4 + 0.6,
          steps: [
            'Analyze input parameters',
            'Decompose complex task',
            'Execute sub-tasks',
            'Synthesize results',
            'Validate output'
          ],
          execution_time: Math.floor(Math.random() * 5000) + 1000,
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json(reasoning);

      case 'orchestrate_agents':
        // Simulate agent orchestration
        const orchestration = {
          orchestration_id: `orchestration-${Date.now()}`,
          primary_agent: data?.primary_agent || 'agent-001',
          supporting_agents: data?.supporting_agents || [],
          task: data?.task || 'General task',
          status: 'initiated',
          progress: 0,
          estimated_completion: new Date(Date.now() + Math.random() * 3600000).toISOString(),
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json({
          success: true,
          orchestration: orchestration
        });

      case 'train_agent':
        // Simulate agent training
        if (!data?.agent_id) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }
        
        const agent = FORGE1_CONFIG.agents.find(a => a.id === data.agent_id);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }
        
        agent.status = 'training';
        
        const training = {
          training_id: `training-${Date.now()}`,
          agent_id: data.agent_id,
          dataset: data?.dataset || 'default',
          epochs: data?.epochs || 100,
            current_epoch: 0,
          loss: 1.0,
          accuracy: 0.0,
          status: 'started',
          estimated_completion: new Date(Date.now() + Math.random() * 7200000).toISOString(),
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json({
          success: true,
          training: training,
          agent: agent
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Agent Logic API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}