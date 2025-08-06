import { NextRequest, NextResponse } from 'next/server';
import { multiLLMExecutor, MultiLLMExecutionRequest } from '@/lib/multi-llm-execution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'execute_multi_llm') {
      const executionRequest: MultiLLMExecutionRequest = data;
      
      // Validate the request
      if (!executionRequest.prompt || !executionRequest.config) {
        return NextResponse.json(
          { error: 'Prompt and config are required' },
          { status: 400 }
        );
      }

      if (!executionRequest.config.models || executionRequest.config.models.length === 0) {
        return NextResponse.json(
          { error: 'At least one model must be configured' },
          { status: 400 }
        );
      }

      // Execute multi-LLM collaboration
      const result = await multiLLMExecutor.execute(executionRequest);

      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || 'Multi-LLM execution failed',
            details: result 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        result
      });
    }

    if (action === 'test_multi_llm_config') {
      // Test the configuration without executing
      const { config } = data;
      
      if (!config || !config.models) {
        return NextResponse.json(
          { error: 'Configuration with models is required' },
          { status: 400 }
        );
      }

      const enabledModels = config.models.filter((m: any) => m.enabled);
      
      return NextResponse.json({
        success: true,
        testResult: {
          totalModels: config.models.length,
          enabledModels: enabledModels.length,
          collaborationMode: config.collaborationMode,
          combinationStrategy: config.combinationStrategy,
          modelRoles: enabledModels.map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            provider: m.provider
          })),
          isValid: enabledModels.length > 0,
          warnings: enabledModels.length === 0 ? ['No models enabled'] : []
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Multi-LLM API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}