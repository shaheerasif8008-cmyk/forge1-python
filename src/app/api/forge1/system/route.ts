import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const layerId = searchParams.get('layer');

    if (layerId) {
      // Return specific layer configuration
      const layer = FORGE1_CONFIG.layers.find(l => l.id === layerId);
      if (!layer) {
        return NextResponse.json(
          { error: 'Layer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ layer });
    }

    // Return full system configuration
    return NextResponse.json({
      system: FORGE1_CONFIG,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Forge1 config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, layerId, config } = body;

    switch (action) {
      case 'toggle_layer':
        const layerIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        FORGE1_CONFIG.layers[layerIndex].config.enabled = 
          !FORGE1_CONFIG.layers[layerIndex].config.enabled;
        FORGE1_CONFIG.layers[layerIndex].status = 
          FORGE1_CONFIG.layers[layerIndex].config.enabled ? 'active' : 'inactive';
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[layerIndex]
        });

      case 'update_config':
        if (!layerId || !config) {
          return NextResponse.json(
            { error: 'Layer ID and config are required' },
            { status: 400 }
          );
        }
        
        const updateIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (updateIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        FORGE1_CONFIG.layers[updateIndex].config.settings = {
          ...FORGE1_CONFIG.layers[updateIndex].config.settings,
          ...config
        };
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[updateIndex]
        });

      case 'start_layer':
        const startIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (startIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        FORGE1_CONFIG.layers[startIndex].config.enabled = true;
        FORGE1_CONFIG.layers[startIndex].status = 'active';
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[startIndex],
          message: `Layer ${layerId} started successfully`
        });

      case 'stop_layer':
        const stopIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (stopIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        FORGE1_CONFIG.layers[stopIndex].config.enabled = false;
        FORGE1_CONFIG.layers[stopIndex].status = 'inactive';
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[stopIndex],
          message: `Layer ${layerId} stopped successfully`
        });

      case 'restart_layer':
        const restartIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (restartIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        // Simulate restart process
        FORGE1_CONFIG.layers[restartIndex].config.enabled = false;
        FORGE1_CONFIG.layers[restartIndex].status = 'restarting';
        
        // Simulate restart delay
        setTimeout(() => {
          FORGE1_CONFIG.layers[restartIndex].config.enabled = true;
          FORGE1_CONFIG.layers[restartIndex].status = 'active';
        }, 2000);
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[restartIndex],
          message: `Layer ${layerId} restart initiated`
        });

      case 'configure_layer':
        const configIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (configIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          layer: FORGE1_CONFIG.layers[configIndex],
          config: FORGE1_CONFIG.layers[configIndex].config,
          message: `Configuration retrieved for layer ${layerId}`
        });

      case 'details_layer':
        const detailsIndex = FORGE1_CONFIG.layers.findIndex(l => l.id === layerId);
        if (detailsIndex === -1) {
          return NextResponse.json(
            { error: 'Layer not found' },
            { status: 404 }
          );
        }
        
        const layer = FORGE1_CONFIG.layers[detailsIndex];
        return NextResponse.json({
          success: true,
          layer: layer,
          details: {
            health: 'good',
            uptime: '24/7',
            lastActivity: new Date().toISOString(),
            metrics: {
              cpu_usage: Math.random() * 100,
              memory_usage: Math.random() * 100,
              request_count: Math.floor(Math.random() * 10000),
              error_rate: Math.random() * 5
            }
          },
          message: `Details retrieved for layer ${layerId}`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating Forge1 config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}