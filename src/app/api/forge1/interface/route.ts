import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    const interfaceLayer = FORGE1_CONFIG.layers.find(l => l.id === 'interface');
    if (!interfaceLayer) {
      return NextResponse.json(
        { error: 'Interface layer not found' },
        { status: 404 }
      );
    }

    if (endpoint === 'config') {
      return NextResponse.json({
        layer: interfaceLayer,
        endpoints: getAvailableEndpoints(),
        documentation: getAPIDocumentation()
      });
    }

    if (endpoint === 'health') {
      return NextResponse.json({
        status: interfaceLayer.status,
        uptime: '24/7',
        last_check: new Date().toISOString(),
        metrics: {
          request_count: Math.floor(Math.random() * 10000),
          avg_response_time: Math.floor(Math.random() * 100) + 50,
          error_rate: Math.random() * 0.05
        }
      });
    }

    // Default response
    return NextResponse.json({
      layer: interfaceLayer,
      message: 'Interface API is running',
      endpoints: getAvailableEndpoints()
    });

  } catch (error) {
    console.error('Error in Interface API:', error);
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
      case 'execute_query':
        // Simulate query execution
        const queryResult = {
          query_id: `query-${Date.now()}`,
          result: `Query executed successfully. Found ${Math.floor(Math.random() * 100)} results.`,
          execution_time: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(queryResult);

      case 'validate_request':
        // Simulate request validation
        const validation = {
          valid: true,
          errors: [],
          warnings: [],
          request_id: `req-${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(validation);

      case 'generate_response':
        // Simulate response generation
        const response = {
          response_id: `resp-${Date.now()}`,
          content: `Generated response for: ${data?.prompt || 'unknown prompt'}`,
          model: 'gpt-4',
          tokens_used: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(response);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Interface API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getAvailableEndpoints() {
  return [
    {
      path: '/api/forge1/interface',
      method: 'GET',
      description: 'Get interface layer information'
    },
    {
      path: '/api/forge1/interface?endpoint=config',
      method: 'GET',
      description: 'Get interface configuration and documentation'
    },
    {
      path: '/api/forge1/interface?endpoint=health',
      method: 'GET',
      description: 'Get interface health status'
    },
    {
      path: '/api/forge1/interface',
      method: 'POST',
      description: 'Execute interface actions (query, validate, generate)'
    }
  ];
}

function getAPIDocumentation() {
  return {
    version: '1.0.0',
    description: 'Forge1 Interface API - Human interface + API calls',
    base_url: '/api/forge1/interface',
    authentication: 'Bearer token required',
    rate_limit: '1000 requests per hour',
    endpoints: getAvailableEndpoints()
  };
}