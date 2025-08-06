import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const visualLayer = FORGE1_CONFIG.layers.find(l => l.id === 'visual');
    if (!visualLayer) {
      return NextResponse.json(
        { error: 'Visual UI layer not found' },
        { status: 404 }
      );
    }

    if (action === 'dashboards') {
      const dashboards = [
        {
          id: 'system_overview',
          name: 'System Overview',
          description: 'Comprehensive system health and performance dashboard',
          widgets: ['system_health', 'performance_metrics', 'resource_usage', 'active_alerts'],
          layout: 'grid',
          refresh_interval: 5000,
          is_public: true,
          last_accessed: new Date(Date.now() - Math.random() * 3600000).toISOString()
        },
        {
          id: 'agent_monitoring',
          name: 'Agent Monitoring',
          description: 'Real-time agent performance and activity tracking',
          widgets: ['agent_status', 'agent_performance', 'agent_logs', 'agent_metrics'],
          layout: 'grid',
          refresh_interval: 3000,
          is_public: false,
          last_accessed: new Date(Date.now() - Math.random() * 1800000).toISOString()
        },
        {
          id: 'workflow_visualization',
          name: 'Workflow Visualization',
          description: 'Visual representation of active workflows and processes',
          widgets: ['workflow_diagram', 'workflow_status', 'workflow_metrics', 'task_progress'],
          layout: 'flow',
          refresh_interval: 2000,
          is_public: true,
          last_accessed: new Date(Date.now() - Math.random() * 7200000).toISOString()
        },
        {
          id: 'resource_monitoring',
          name: 'Resource Monitoring',
          description: 'System resource utilization and capacity planning',
          widgets: ['cpu_usage', 'memory_usage', 'disk_usage', 'network_traffic'],
          layout: 'grid',
          refresh_interval: 1000,
          is_public: false,
          last_accessed: new Date(Date.now() - Math.random() * 900000).toISOString()
        }
      ];

      return NextResponse.json({
        dashboards: dashboards,
        total_dashboards: dashboards.length,
        public_dashboards: dashboards.filter(d => d.is_public).length
      });
    }

    if (action === 'widgets') {
      const widgets = [
        {
          id: 'system_health',
          name: 'System Health',
          type: 'gauge',
          data_source: 'system_status',
          refresh_rate: 5000,
          config: {
            min_value: 0,
            max_value: 100,
            thresholds: {
              critical: 20,
              warning: 50,
              good: 80
            }
          }
        },
        {
          id: 'agent_status',
          name: 'Agent Status',
          type: 'table',
          data_source: 'agents',
          refresh_rate: 3000,
          config: {
            columns: ['name', 'status', 'performance', 'last_activity'],
            sortable: true,
            filterable: true
          }
        },
        {
          id: 'workflow_diagram',
          name: 'Workflow Diagram',
          type: 'graph',
          data_source: 'workflows',
          refresh_rate: 2000,
          config: {
            layout: 'hierarchical',
            show_labels: true,
            interactive: true
          }
        },
        {
          id: 'performance_metrics',
          name: 'Performance Metrics',
          type: 'line_chart',
          data_source: 'metrics',
          refresh_rate: 5000,
          config: {
            time_range: '1h',
            metrics: ['cpu', 'memory', 'network'],
            show_legend: true
          }
        },
        {
          id: 'resource_usage',
          name: 'Resource Usage',
          type: 'bar_chart',
          data_source: 'resources',
          refresh_rate: 1000,
          config: {
            group_by: 'service',
            show_percentage: true
          }
        },
        {
          id: 'active_alerts',
          name: 'Active Alerts',
          type: 'list',
          data_source: 'alerts',
          refresh_rate: 3000,
          config: {
            max_items: 10,
            show_timestamp: true,
            group_by_severity: true
          }
        }
      ];

      return NextResponse.json({
        widgets: widgets,
        total_widgets: widgets.length
      });
    }

    if (action === 'sessions') {
      const sessions = [
        {
          id: 'session-001',
          user_id: 'user-001',
          dashboard_id: 'system_overview',
          start_time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          last_activity: new Date(Date.now() - Math.random() * 300000).toISOString(),
          duration: Math.floor(Math.random() * 3600) + 300,
          interactions: Math.floor(Math.random() * 100) + 20,
          status: 'active'
        },
        {
          id: 'session-002',
          user_id: 'user-002',
          dashboard_id: 'agent_monitoring',
          start_time: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          last_activity: new Date(Date.now() - Math.random() * 600000).toISOString(),
          duration: Math.floor(Math.random() * 1800) + 200,
          interactions: Math.floor(Math.random() * 50) + 10,
          status: 'active'
        },
        {
          id: 'session-003',
          user_id: 'user-003',
          dashboard_id: 'workflow_visualization',
          start_time: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          last_activity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          duration: Math.floor(Math.random() * 7200) + 600,
          interactions: Math.floor(Math.random() * 200) + 50,
          status: 'inactive'
        }
      ];

      return NextResponse.json({
        sessions: sessions,
        total_sessions: sessions.length,
        active_sessions: sessions.filter(s => s.status === 'active').length
      });
    }

    // Default response
    return NextResponse.json({
      layer: visualLayer,
      message: 'Visual UI layer is running',
      capabilities: [
        'SuperAGI dashboard integration',
        'Real-time visualization',
        'Interactive widgets',
        'Custom dashboard creation',
        'Session management'
      ]
    });

  } catch (error) {
    console.error('Error in Visual UI API:', error);
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
      case 'create_dashboard':
        if (!data?.name || !data?.description) {
          return NextResponse.json(
            { error: 'Dashboard name and description are required' },
            { status: 400 }
          );
        }

        const dashboard = {
          dashboard_id: `dashboard-${Date.now()}`,
          name: data.name,
          description: data.description,
          widgets: data.widgets || [],
          layout: data.layout || 'grid',
          refresh_interval: data.refresh_interval || 5000,
          is_public: data.is_public || false,
          created_at: new Date().toISOString(),
          created_by: data.created_by || 'system'
        };

        return NextResponse.json({
          success: true,
          dashboard: dashboard
        });

      case 'create_widget':
        if (!data?.name || !data?.type || !data?.data_source) {
          return NextResponse.json(
            { error: 'Widget name, type, and data source are required' },
            { status: 400 }
          );
        }

        const widget = {
          widget_id: `widget-${Date.now()}`,
          name: data.name,
          type: data.type,
          data_source: data.data_source,
          refresh_rate: data.refresh_rate || 5000,
          config: data.config || {},
          created_at: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          widget: widget
        });

      case 'update_dashboard_layout':
        if (!data?.dashboard_id || !data?.layout) {
          return NextResponse.json(
            { error: 'Dashboard ID and layout are required' },
            { status: 400 }
          );
        }

        const layoutUpdate = {
          dashboard_id: data.dashboard_id,
          layout: data.layout,
          updated_at: new Date().toISOString(),
          widgets: data.widgets || []
        };

        return NextResponse.json({
          success: true,
          update: layoutUpdate
        });

      case 'export_dashboard':
        if (!data?.dashboard_id) {
          return NextResponse.json(
            { error: 'Dashboard ID is required' },
            { status: 400 }
          );
        }

        const exportData = {
          dashboard_id: data.dashboard_id,
          export_format: data.format || 'json',
          export_data: {
            widgets: [],
            layout: 'grid',
            config: {}
          },
          exported_at: new Date().toISOString(),
          download_url: `/api/forge1/visual/export/${data.dashboard_id}.${data.format || 'json'}`
        };

        return NextResponse.json({
          success: true,
          export: exportData
        });

      case 'session_analytics':
        const analytics = {
          analytics_id: `analytics-${Date.now()}`,
          total_sessions: Math.floor(Math.random() * 1000) + 500,
          active_sessions: Math.floor(Math.random() * 50) + 10,
          avg_session_duration: Math.floor(Math.random() * 1800) + 300,
          most_popular_dashboard: 'system_overview',
          user_engagement: {
            high: Math.floor(Math.random() * 40) + 30,
            medium: Math.floor(Math.random() * 30) + 20,
            low: Math.floor(Math.random() * 20) + 10
          },
          widget_usage: {
            system_health: Math.floor(Math.random() * 1000) + 500,
            agent_status: Math.floor(Math.random() * 800) + 400,
            workflow_diagram: Math.floor(Math.random() * 600) + 300,
            performance_metrics: Math.floor(Math.random() * 900) + 450
          },
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(analytics);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Visual UI API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}