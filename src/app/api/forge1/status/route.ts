import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    // Calculate system health based on layer statuses
    const activeLayers = FORGE1_CONFIG.layers.filter(l => l.status === 'active');
    const totalLayers = FORGE1_CONFIG.layers.length;
    const healthPercentage = (activeLayers.length / totalLayers) * 100;

    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    if (healthPercentage >= 90) overallHealth = 'excellent';
    else if (healthPercentage >= 70) overallHealth = 'good';
    else if (healthPercentage >= 50) overallHealth = 'fair';
    else overallHealth = 'poor';

    // Calculate system load (simulated)
    const systemLoad = Math.random() * 0.8 + 0.1; // Random between 0.1 and 0.9

    // Update system status
    FORGE1_CONFIG.status = {
      ...FORGE1_CONFIG.status,
      overall_health: overallHealth,
      system_load: Math.round(systemLoad * 100) / 100,
      last_update: new Date()
    };

    // Generate some sample alerts
    const alerts = [];
    
    // Check for layers with low progress
    const lowProgressLayers = FORGE1_CONFIG.layers.filter(l => l.progress < 50);
    for (const layer of lowProgressLayers) {
      alerts.push({
        id: `alert-${layer.id}-${Date.now()}`,
        type: 'warning' as const,
        message: `${layer.name} layer has low progress (${layer.progress}%)`,
        layer: layer.id,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check for inactive layers
    const inactiveLayers = FORGE1_CONFIG.layers.filter(l => l.status === 'inactive');
    for (const layer of inactiveLayers) {
      alerts.push({
        id: `alert-${layer.id}-${Date.now()}`,
        type: 'info' as const,
        message: `${layer.name} layer is inactive`,
        layer: layer.id,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check system load
    if (systemLoad > 0.8) {
      alerts.push({
        id: `alert-load-${Date.now()}`,
        type: 'warning' as const,
        message: 'High system load detected',
        layer: 'system',
        timestamp: new Date(),
        resolved: false
      });
    }

    return NextResponse.json({
      status: FORGE1_CONFIG.status,
      metrics: {
        health_percentage: Math.round(healthPercentage),
        active_layers: activeLayers.length,
        total_layers: totalLayers,
        system_load: systemLoad,
        uptime: '24/7'
      },
      alerts: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}