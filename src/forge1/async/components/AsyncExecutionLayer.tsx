"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Settings, 
  Play, 
  Pause,
  Users,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  X,
  RotateCcw,
  Scale
} from "lucide-react";

interface Worker {
  id: string;
  name: string;
  status: string;
  concurrency: number;
  active_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  uptime: string;
  last_heartbeat: string;
}

interface Queue {
  id: string;
  name: string;
  pending_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  priority: string;
}

interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
  worker_id: string | null;
  queue: string;
  started_at: string | null;
  estimated_completion: string | null;
}

interface AsyncMetrics {
  total_tasks_processed: number;
  avg_task_duration: number;
  success_rate: number;
  worker_utilization: number;
  queue_depth: number;
  throughput: number;
  celery_broker: string;
  result_backend: string;
}

export default function AsyncExecutionLayer() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<AsyncMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    type: '',
    priority: 'normal',
    queue: 'default'
  });

  useEffect(() => {
    fetchWorkers();
    fetchQueues();
    fetchTasks();
    fetchMetrics();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('/api/forge1/async?action=workers');
      const data = await response.json();
      setWorkers(data.workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/forge1/async?action=queues');
      const data = await response.json();
      setQueues(data.queues);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/forge1/async?action=tasks');
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/forge1/async?action=metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleSubmitTask = async () => {
    if (!newTask.name.trim() || !newTask.type.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_task',
          data: newTask
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewTask({ name: '', type: '', priority: 'normal', queue: 'default' });
        fetchTasks();
        fetchQueues();
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_task',
          data: { task_id: taskId }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error cancelling task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry_task',
          data: { task_id: taskId }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error retrying task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500 bg-opacity-10">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Async Execution Layer</span>
                  <Badge variant="outline">Celery + FastAPI + Function Calling</Badge>
                </CardTitle>
                <CardDescription>
                  Async background + parallel workflows
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchWorkers();
                  fetchQueues();
                  fetchTasks();
                  fetchMetrics();
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {workers.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'running').length}
              </div>
              <div className="text-sm text-slate-600">Running Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {queues.reduce((sum, q) => sum + q.pending_tasks, 0)}
              </div>
              <div className="text-sm text-slate-600">Pending Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(metrics?.success_rate * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="submit">Submit Task</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Celery Workers</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage worker processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {workers.map((worker) => (
                  <Card key={worker.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(worker.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{worker.name}</h4>
                              <Badge variant="outline">{worker.id}</Badge>
                              <Badge 
                                variant={worker.status === 'active' ? 'default' : 'secondary'}
                              >
                                {worker.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Concurrency: {worker.concurrency}</span>
                              <span>Active: {worker.active_tasks}</span>
                              <span>Completed: {worker.completed_tasks.toLocaleString()}</span>
                              <span>Failed: {worker.failed_tasks}</span>
                              <span>Uptime: {worker.uptime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Utilization</span>
                              <span>{Math.round((worker.active_tasks / worker.concurrency) * 100)}%</span>
                            </div>
                            <Progress value={(worker.active_tasks / worker.concurrency) * 100} className="h-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Task Queues</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage task queues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {queues.map((queue) => (
                  <Card key={queue.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{queue.name}</h4>
                              <Badge variant="outline">{queue.id}</Badge>
                              <Badge 
                                variant={
                                  queue.priority === 'high' ? 'destructive' :
                                  queue.priority === 'normal' ? 'default' : 'secondary'
                                }
                              >
                                {queue.priority}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Pending: {queue.pending_tasks}</span>
                              <span>Active: {queue.active_tasks}</span>
                              <span>Completed: {queue.completed_tasks.toLocaleString()}</span>
                              <span>Failed: {queue.failed_tasks}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {queue.pending_tasks + queue.active_tasks}
                          </div>
                          <div className="text-xs text-slate-500">Total Tasks</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Active Tasks</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage running tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{task.name}</h4>
                              <Badge variant="outline">{task.id}</Badge>
                              <Badge 
                                variant={
                                  task.status === 'running' ? 'default' :
                                  task.status === 'pending' ? 'secondary' :
                                  task.status === 'completed' ? 'outline' : 'destructive'
                                }
                              >
                                {task.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Worker: {task.worker_id || 'Unassigned'}</span>
                              <span>Queue: {task.queue}</span>
                              {task.started_at && (
                                <span>Started: {new Date(task.started_at).toLocaleTimeString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status === 'running' && (
                            <div className="w-24">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-1" />
                            </div>
                          )}
                          <div className="flex space-x-1">
                            {task.status === 'pending' && (
                              <Button
                                onClick={() => handleCancelTask(task.id)}
                                size="sm"
                                variant="outline"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                            {task.status === 'failed' && (
                              <Button
                                onClick={() => handleRetryTask(task.id)}
                                size="sm"
                                variant="outline"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Submit New Task</span>
              </CardTitle>
              <CardDescription>
                Create and submit new async tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Name</label>
                  <Input
                    placeholder="Enter task name..."
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Type</label>
                  <Input
                    placeholder="Enter task type..."
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Queue</label>
                  <Select value={newTask.queue} onValueChange={(value) => setNewTask({...newTask, queue: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="high_priority">High Priority</SelectItem>
                      <SelectItem value="low_priority">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleSubmitTask}
                disabled={isLoading || !newTask.name.trim() || !newTask.type.trim()}
                className="w-full"
              >
                {isLoading ? 'Submitting...' : 'Submit Task'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Execution Analytics</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {(metrics?.success_rate * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.success_rate * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Worker Utilization</span>
                      <span className="font-medium">
                        {(metrics?.worker_utilization * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.worker_utilization * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">System Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Tasks Processed: </span>
                      <span className="font-medium">{metrics?.total_tasks_processed?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Task Duration: </span>
                      <span className="font-medium">{metrics?.avg_task_duration || 0}s</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Queue Depth: </span>
                      <span className="font-medium">{metrics?.queue_depth || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Throughput: </span>
                      <span className="font-medium">{metrics?.throughput || 0} tasks/min</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Celery Broker: </span>
                      <span className="font-medium">{metrics?.celery_broker || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Result Backend: </span>
                      <span className="font-medium">{metrics?.result_backend || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Task completed successfully</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New worker started</span>
                      <span className="text-slate-500">5 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Task submitted to queue</span>
                      <span className="text-slate-500">8 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worker scaled up</span>
                      <span className="text-slate-500">15 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}