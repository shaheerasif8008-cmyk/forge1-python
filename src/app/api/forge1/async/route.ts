import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const asyncLayer = FORGE1_CONFIG.layers.find(l => l.id === 'async');
    if (!asyncLayer) {
      return NextResponse.json(
        { error: 'Async Execution layer not found' },
        { status: 404 }
      );
    }

    if (action === 'workers') {
      const workers = [
        {
          id: 'worker-1',
          name: 'Primary Worker',
          status: 'active',
          concurrency: 10,
          active_tasks: Math.floor(Math.random() * 8) + 2,
          completed_tasks: Math.floor(Math.random() * 10000) + 5000,
          failed_tasks: Math.floor(Math.random() * 100) + 10,
          uptime: '24h 15m',
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 'worker-2',
          name: 'Secondary Worker',
          status: 'active',
          concurrency: 8,
          active_tasks: Math.floor(Math.random() * 6) + 1,
          completed_tasks: Math.floor(Math.random() * 8000) + 4000,
          failed_tasks: Math.floor(Math.random() * 80) + 8,
          uptime: '18h 42m',
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 'worker-3',
          name: 'Backup Worker',
          status: 'idle',
          concurrency: 5,
          active_tasks: 0,
          completed_tasks: Math.floor(Math.random() * 5000) + 2000,
          failed_tasks: Math.floor(Math.random() * 50) + 5,
          uptime: '12h 30m',
          last_heartbeat: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        workers: workers,
        total_workers: workers.length,
        active_workers: workers.filter(w => w.status === 'active').length
      });
    }

    if (action === 'queues') {
      const queues = [
        {
          id: 'default',
          name: 'Default Queue',
          pending_tasks: Math.floor(Math.random() * 100) + 20,
          active_tasks: Math.floor(Math.random() * 20) + 5,
          completed_tasks: Math.floor(Math.random() * 10000) + 5000,
          failed_tasks: Math.floor(Math.random() * 200) + 20,
          priority: 'normal'
        },
        {
          id: 'high_priority',
          name: 'High Priority Queue',
          pending_tasks: Math.floor(Math.random() * 20) + 5,
          active_tasks: Math.floor(Math.random() * 10) + 2,
          completed_tasks: Math.floor(Math.random() * 5000) + 2000,
          failed_tasks: Math.floor(Math.random() * 50) + 5,
          priority: 'high'
        },
        {
          id: 'low_priority',
          name: 'Low Priority Queue',
          pending_tasks: Math.floor(Math.random() * 200) + 50,
          active_tasks: Math.floor(Math.random() * 30) + 10,
          completed_tasks: Math.floor(Math.random() * 15000) + 8000,
          failed_tasks: Math.floor(Math.random() * 300) + 30,
          priority: 'low'
        }
      ];

      return NextResponse.json({
        queues: queues,
        total_queues: queues.length
      });
    }

    if (action === 'tasks') {
      const tasks = [
        {
          id: 'task-001',
          name: 'Data Processing Task',
          status: 'running',
          progress: Math.floor(Math.random() * 100),
          worker_id: 'worker-1',
          queue: 'default',
          started_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          estimated_completion: new Date(Date.now() + Math.random() * 3600000).toISOString()
        },
        {
          id: 'task-002',
          name: 'Model Training Task',
          status: 'pending',
          progress: 0,
          worker_id: null,
          queue: 'high_priority',
          started_at: null,
          estimated_completion: null
        },
        {
          id: 'task-003',
          name: 'Report Generation Task',
          status: 'completed',
          progress: 100,
          worker_id: 'worker-2',
          queue: 'default',
          started_at: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          estimated_completion: new Date(Date.now() - Math.random() * 3600000).toISOString()
        },
        {
          id: 'task-004',
          name: 'Data Analysis Task',
          status: 'failed',
          progress: Math.floor(Math.random() * 50),
          worker_id: 'worker-3',
          queue: 'low_priority',
          started_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          estimated_completion: null
        }
      ];

      return NextResponse.json({
        tasks: tasks,
        total_tasks: tasks.length,
        running_tasks: tasks.filter(t => t.status === 'running').length,
        pending_tasks: tasks.filter(t => t.status === 'pending').length,
        completed_tasks: tasks.filter(t => t.status === 'completed').length,
        failed_tasks: tasks.filter(t => t.status === 'failed').length
      });
    }

    if (action === 'metrics') {
      return NextResponse.json({
        total_tasks_processed: Math.floor(Math.random() * 100000) + 50000,
        avg_task_duration: Math.floor(Math.random() * 300) + 60,
        success_rate: Math.random() * 0.1 + 0.9,
        worker_utilization: Math.random() * 0.3 + 0.5,
        queue_depth: Math.floor(Math.random() * 200) + 50,
        throughput: Math.floor(Math.random() * 1000) + 500,
        celery_broker: 'redis',
        result_backend: 'postgresql'
      });
    }

    // Default response
    return NextResponse.json({
      layer: asyncLayer,
      message: 'Async Execution layer is running',
      capabilities: [
        'Celery task queue management',
        'Background job processing',
        'Worker orchestration',
        'Priority queue management',
        'Task monitoring and logging'
      ]
    });

  } catch (error) {
    console.error('Error in Async Execution API:', error);
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
      case 'submit_task':
        if (!data?.task_name || !data?.task_type) {
          return NextResponse.json(
            { error: 'Task name and type are required' },
            { status: 400 }
          );
        }

        const task = {
          task_id: `task-${Date.now()}`,
          name: data.task_name,
          type: data.task_type,
          status: 'pending',
          priority: data.priority || 'normal',
          queue: data.queue || 'default',
          submitted_at: new Date().toISOString(),
          estimated_duration: data.estimated_duration || Math.floor(Math.random() * 300) + 60,
          worker_id: null,
          progress: 0
        };

        return NextResponse.json({
          success: true,
          task: task
        });

      case 'cancel_task':
        if (!data?.task_id) {
          return NextResponse.json(
            { error: 'Task ID is required' },
            { status: 400 }
          );
        }

        const cancelResult = {
          task_id: data.task_id,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          reason: data.reason || 'User requested cancellation'
        };

        return NextResponse.json({
          success: true,
          result: cancelResult
        });

      case 'retry_task':
        if (!data?.task_id) {
          return NextResponse.json(
            { error: 'Task ID is required' },
            { status: 400 }
          );
        }

        const retryResult = {
          task_id: data.task_id,
          status: 'pending',
          retried_at: new Date().toISOString(),
          retry_count: (data.retry_count || 0) + 1,
          max_retries: data.max_retries || 3
        };

        return NextResponse.json({
          success: true,
          result: retryResult
        });

      case 'scale_workers':
        if (!data?.worker_count || data.worker_count < 1) {
          return NextResponse.json(
            { error: 'Valid worker count is required' },
            { status: 400 }
          );
        }

        const scaleResult = {
          scaling_action: 'scale_workers',
          target_worker_count: data.worker_count,
          current_worker_count: Math.floor(Math.random() * 10) + 3,
          status: 'initiated',
          estimated_completion: new Date(Date.now() + Math.random() * 300000).toISOString(),
          timestamp: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          result: scaleResult
        });

      case 'purge_queue':
        if (!data?.queue_name) {
          return NextResponse.json(
            { error: 'Queue name is required' },
            { status: 400 }
          );
        }

        const purgeResult = {
          queue_name: data.queue_name,
          purged_tasks: Math.floor(Math.random() * 100) + 20,
          freed_memory: `${Math.floor(Math.random() * 2) + 0.5}GB`,
          operation_time: Math.floor(Math.random() * 5000) + 1000,
          timestamp: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          result: purgeResult
        });

      case 'worker_health_check':
        const healthCheck = {
          check_id: `health-${Date.now()}`,
          worker_id: data?.worker_id || 'all',
          status: 'healthy',
          response_time: Math.floor(Math.random() * 100) + 10,
          memory_usage: Math.random() * 0.8 + 0.1,
          cpu_usage: Math.random() * 0.7 + 0.2,
          active_connections: Math.floor(Math.random() * 50) + 10,
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(healthCheck);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Async Execution API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}