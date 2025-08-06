import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const actionsLayer = FORGE1_CONFIG.layers.find(l => l.id === 'actions');
    if (!actionsLayer) {
      return NextResponse.json(
        { error: 'Actions layer not found' },
        { status: 404 }
      );
    }

    if (action === 'tools') {
      const tools = [
        {
          id: 'web_search',
          name: 'Web Search',
          description: 'Search the web for current information',
          type: 'langchain',
          status: 'active',
          usage_count: Math.floor(Math.random() * 1000) + 100
        },
        {
          id: 'calculator',
          name: 'Calculator',
          description: 'Perform mathematical calculations',
          type: 'custom',
          status: 'active',
          usage_count: Math.floor(Math.random() * 500) + 50
        },
        {
          id: 'file_io',
          name: 'File I/O',
          description: 'Read and write files',
          type: 'custom',
          status: 'active',
          usage_count: Math.floor(Math.random() * 300) + 30
        },
        {
          id: 'api_caller',
          name: 'API Caller',
          description: 'Make HTTP API calls',
          type: 'langchain',
          status: 'active',
          usage_count: Math.floor(Math.random() * 800) + 80
        },
        {
          id: 'data_analyzer',
          name: 'Data Analyzer',
          description: 'Analyze and process data',
          type: 'custom',
          status: 'active',
          usage_count: Math.floor(Math.random() * 600) + 60
        },
        {
          id: 'code_executor',
          name: 'Code Executor',
          description: 'Execute code snippets',
          type: 'custom',
          status: 'active',
          usage_count: Math.floor(Math.random() * 400) + 40
        }
      ];

      return NextResponse.json({
        tools: tools,
        total_tools: tools.length,
        active_tools: tools.filter(t => t.status === 'active').length
      });
    }

    if (action === 'metrics') {
      return NextResponse.json({
        total_executions: Math.floor(Math.random() * 10000) + 1000,
        successful_executions: Math.floor(Math.random() * 9000) + 900,
        failed_executions: Math.floor(Math.random() * 100) + 10,
        avg_execution_time: Math.floor(Math.random() * 500) + 50,
        tools_usage: {
          web_search: Math.floor(Math.random() * 1000) + 100,
          calculator: Math.floor(Math.random() * 500) + 50,
          file_io: Math.floor(Math.random() * 300) + 30,
          api_caller: Math.floor(Math.random() * 800) + 80,
          data_analyzer: Math.floor(Math.random() * 600) + 60,
          code_executor: Math.floor(Math.random() * 400) + 40
        }
      });
    }

    // Default response
    return NextResponse.json({
      layer: actionsLayer,
      message: 'Actions/Tools layer is running',
      capabilities: [
        'LangChain tool integration',
        'Custom tool development',
        'Tool orchestration',
        'Execution monitoring',
        'Performance analytics'
      ]
    });

  } catch (error) {
    console.error('Error in Actions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tool, data } = body;

    switch (action) {
      case 'execute_tool':
        if (!tool || !data) {
          return NextResponse.json(
            { error: 'Tool and data are required' },
            { status: 400 }
          );
        }

        const execution = {
          execution_id: `exec-${Date.now()}`,
          tool: tool,
          input: data,
          output: `Tool execution result for ${tool}`,
          status: 'completed',
          execution_time: Math.floor(Math.random() * 2000) + 100,
          timestamp: new Date().toISOString(),
          metadata: {
            success: true,
            error: null,
            result_size: Math.floor(Math.random() * 1000) + 100
          }
        };

        return NextResponse.json(execution);

      case 'register_tool':
        if (!data?.name || !data?.description) {
          return NextResponse.json(
            { error: 'Tool name and description are required' },
            { status: 400 }
          );
        }

        const newTool = {
          id: `tool-${Date.now()}`,
          name: data.name,
          description: data.description,
          type: data.type || 'custom',
          status: 'active',
          usage_count: 0,
          created_at: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          tool: newTool
        });

      case 'batch_execute':
        if (!data?.tools || !Array.isArray(data.tools)) {
          return NextResponse.json(
            { error: 'Tools array is required' },
            { status: 400 }
          );
        }

        const batchResults = data.tools.map((toolData: any, index: number) => ({
          execution_id: `batch-${Date.now()}-${index}`,
          tool: toolData.tool,
          input: toolData.data,
          output: `Batch execution result for ${toolData.tool}`,
          status: 'completed',
          execution_time: Math.floor(Math.random() * 1500) + 100,
          timestamp: new Date().toISOString()
        }));

        return NextResponse.json({
          success: true,
          batch_id: `batch-${Date.now()}`,
          results: batchResults,
          total_executions: batchResults.length
        });

      case 'tool_performance':
        const performance = {
          tool_id: tool || 'unknown',
          metrics: {
            avg_execution_time: Math.floor(Math.random() * 1000) + 100,
            success_rate: Math.random() * 0.1 + 0.9,
            total_executions: Math.floor(Math.random() * 1000) + 100,
            error_rate: Math.random() * 0.1
          },
          recommendations: [
            'Optimize execution time',
            'Add error handling',
            'Improve input validation'
          ],
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(performance);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Actions API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}