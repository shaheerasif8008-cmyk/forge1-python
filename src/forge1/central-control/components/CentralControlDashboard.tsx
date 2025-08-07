"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Cpu, 
  Network, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Brain,
  Eye,
  Database,
  Shield,
  Cloud,
  Heart,
  Cube,
  Workflow,
  TrendingUp,
  BarChart3,
  Users,
  MapPin,
  Layers,
  Plus,
  Target,
  Lightbulb
} from "lucide-react";
import { CentralControlService, SystemTask, SystemWorkflow, SystemHealth } from "../service";

const centralControlService = new CentralControlService();

export default function CentralControlDashboard() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [tasks, setTasks] = useState<SystemTask[]>([]);
  const [workflows, setWorkflows] = useState<SystemWorkflow[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedTask, setSelectedTask] = useState<SystemTask | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SystemWorkflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Form states
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<SystemTask['priority']>('medium');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [coordinationStrategy, setCoordinationStrategy] = useState('adaptive');

  useEffect(() => {
    loadSystemStatus();
    loadTasks();
    loadWorkflows();
    loadAlerts();
    loadSystemHealth();
    
    // Set up periodic health checks
    const healthInterval = setInterval(() => {
      loadSystemHealth();
    }, 30000); // Every 30 seconds

    return () => clearInterval(healthInterval);
  }, []);

  const loadSystemStatus = () => {
    const status = centralControlService.getSystemStatus();
    setSystemStatus(status);
  };

  const loadTasks = () => {
    const taskList = centralControlService.getTasks();
    setTasks(taskList);
  };

  const loadWorkflows = () => {
    const workflowList = centralControlService.getWorkflows();
    setWorkflows(workflowList);
  };

  const loadAlerts = () => {
    const alertList = centralControlService.getAlerts();
    setAlerts(alertList);
  };

  const loadSystemHealth = async () => {
    try {
      const health = await centralControlService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const handleExecuteTask = async () => {
    if (!taskName || !taskDescription || selectedModules.length === 0) return;

    setIsExecuting(true);
    try {
      const newTask = await centralControlService.executeTask({
        name: taskName,
        description: taskDescription,
        priority: taskPriority,
        modules_involved: selectedModules,
        coordination_strategy: coordinationStrategy,
        input_data: { timestamp: new Date().toISOString() }
      });

      setTasks(prev => [newTask, ...prev]);
      setTaskName("");
      setTaskDescription("");
      setSelectedModules([]);
    } catch (error) {
      console.error('Task execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getModuleIcon = (moduleType: string) => {
    switch (moduleType) {
      case 'world_modeling':
        return <Brain className="w-4 h-4" />;
      case 'vision':
        return <Eye className="w-4 h-4" />;
      case 'api_workers':
        return <Database className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      case 'saas_agents':
        return <Cloud className="w-4 h-4" />;
      case 'emotional':
        return <Heart className="w-4 h-4" />;
      case 'spatial':
        return <Cube className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'failed':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableModules = [
    { id: 'world_modeling', name: 'World Modeling & Planning', icon: Brain },
    { id: 'vision', name: 'Vision Beyond Images', icon: Eye },
    { id: 'api_workers', name: 'API Worker Agents', icon: Database },
    { id: 'compliance', name: 'Compliance & Legal', icon: Shield },
    { id: 'saas_agents', name: 'SaaS-as-Agent', icon: Cloud },
    { id: 'emotional', name: 'Emotional AI', icon: Heart },
    { id: 'spatial', name: 'Spatial Agents / XR', icon: Cube }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Central AI Control System</h2>
          <p className="text-muted-foreground">
            Coordinate and control all AI features with intelligent orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {systemHealth && (
            <Badge variant="outline" className={getHealthColor(systemHealth.overall_status)}>
              {systemHealth.overall_status.toUpperCase()}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadSystemHealth}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Execution</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.performance_metrics.active_modules || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus?.performance_metrics.total_modules || 0} total modules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(systemStatus?.performance_metrics.average_response_time || 0)}ms
                </div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.performance_metrics.system_uptime || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Overall system uptime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'running').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tasks.filter(t => t.status === 'pending').length} pending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="w-5 h-5" />
                <span>AI Modules Status</span>
              </CardTitle>
              <CardDescription>
                Status and performance of all AI modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemStatus?.modules.map((module: any) => (
                  <div key={module.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getModuleIcon(module.type)}
                        <span className="font-medium">{module.name}</span>
                      </div>
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span>{module.performance.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span>{module.performance.response_time}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Success:</span>
                        <span>{module.performance.success_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Task */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create System Task</span>
                </CardTitle>
                <CardDescription>
                  Execute coordinated tasks across multiple AI modules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe the task"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={taskPriority} onValueChange={(value: any) => setTaskPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Modules to Involve</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableModules.map((module) => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={module.id}
                          checked={selectedModules.includes(module.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModules(prev => [...prev, module.id]);
                            } else {
                              setSelectedModules(prev => prev.filter(id => id !== module.id));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={module.id} className="flex items-center space-x-1 text-sm">
                          <module.icon className="w-3 h-3" />
                          <span>{module.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="coordinationStrategy">Coordination Strategy</Label>
                  <Select value={coordinationStrategy} onValueChange={setCoordinationStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="adaptive">Adaptive</SelectItem>
                      <SelectItem value="priority_based">Priority Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleExecuteTask} 
                  disabled={isExecuting || !taskName || !taskDescription || selectedModules.length === 0}
                  className="w-full"
                >
                  {isExecuting ? "Executing..." : "Execute Task"}
                </Button>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>System Tasks</CardTitle>
                <CardDescription>
                  Recent and active system tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTask?.id === task.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            {task.modules_involved.length} modules
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{task.description}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {task.coordination_strategy.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.progress}% complete
                        </div>
                      </div>
                      {task.status === 'running' && (
                        <Progress value={task.progress} className="h-1 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflows List */}
            <Card>
              <CardHeader>
                <CardTitle>System Workflows</CardTitle>
                <CardDescription>
                  Predefined multi-module workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkflow?.id === workflow.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Workflow className="w-4 h-4" />
                          <span className="font-medium">{workflow.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(workflow.status)}
                          <Badge variant="outline">
                            {workflow.steps.length} steps
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{workflow.description}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-gray-500">Executions:</span>
                          <span className="ml-1 font-medium">{workflow.performance_metrics.total_executions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Success:</span>
                          <span className="ml-1 font-medium">{Math.round(workflow.performance_metrics.success_rate)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Workflow Details</span>
                </CardTitle>
                <CardDescription>
                  Detailed workflow information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkflow ? (
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">{selectedWorkflow.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedWorkflow.description}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedWorkflow.status)}
                          <span className="font-medium capitalize">{selectedWorkflow.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Version</div>
                        <div className="font-medium">{selectedWorkflow.version}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Performance Metrics</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Total Executions:</span>
                          <span className="ml-1 font-medium">{selectedWorkflow.performance_metrics.total_executions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <span className="ml-1 font-medium">{Math.round(selectedWorkflow.performance_metrics.success_rate)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Time:</span>
                          <span className="ml-1 font-medium">{selectedWorkflow.performance_metrics.average_execution_time}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Run:</span>
                          <span className="ml-1 font-medium">{selectedWorkflow.performance_metrics.last_execution.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Steps</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedWorkflow.steps.map((step, index) => (
                          <div key={step.id} className="text-sm p-2 border rounded">
                            <div className="font-medium">{index + 1}. {step.name}</div>
                            <div className="text-xs text-gray-600">
                              Module: {step.module_id} • Timeout: {step.timeout}ms
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a workflow to view details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription>
                  Overall system health and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemHealth ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getHealthColor(systemHealth.overall_status)}`}>
                          {systemHealth.overall_status.toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Status</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {systemHealth.system_metrics.active_modules}/{systemHealth.system_metrics.total_modules}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Modules</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>System Uptime</span>
                        <span className="font-medium">{systemHealth.system_metrics.system_uptime}%</span>
                      </div>
                      <Progress value={systemHealth.system_metrics.system_uptime} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Avg Response Time</span>
                        <span className="font-medium">{Math.round(systemHealth.system_metrics.average_response_time)}ms</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (systemHealth.system_metrics.average_response_time / 5))} 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Resource Utilization</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU</span>
                          <span>{Math.round(systemHealth.system_metrics.resource_utilization.cpu)}%</span>
                        </div>
                        <Progress value={systemHealth.system_metrics.resource_utilization.cpu} className="h-1" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Memory</span>
                          <span>{Math.round(systemHealth.system_metrics.resource_utilization.memory)}%</span>
                        </div>
                        <Progress value={systemHealth.system_metrics.resource_utilization.memory} className="h-1" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Network</span>
                          <span>{Math.round(systemHealth.system_metrics.resource_utilization.network)}%</span>
                        </div>
                        <Progress value={systemHealth.system_metrics.resource_utilization.network} className="h-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Loading system health...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Module Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Module Health</span>
                </CardTitle>
                <CardDescription>
                  Individual module health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemHealth ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(systemHealth.module_health).map(([moduleId, health]) => {
                      const module = systemStatus?.modules.find((m: any) => m.id === moduleId);
                      return (
                        <div key={moduleId} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getModuleIcon(module?.type || moduleId)}
                              <span className="font-medium">{module?.name || moduleId}</span>
                            </div>
                            <Badge variant="outline" className={getHealthColor(health)}>
                              {health.toUpperCase()}
                            </Badge>
                          </div>
                          {module && (
                            <div className="text-sm text-muted-foreground">
                              Uptime: {module.performance.uptime}% • Response: {module.performance.response_time}ms
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Loading module health...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Active Alerts</span>
                </CardTitle>
                <CardDescription>
                  System alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.type === 'critical' ? 'text-red-500' : 
                            alert.type === 'error' ? 'text-red-400' : 
                            alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <span className="font-medium capitalize">{alert.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">NEW</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">{alert.message}</div>
                      {alert.module_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Module: {alert.module_id}
                        </div>
                      )}
                    </div>
                  ))}
                  {alerts.filter(alert => !alert.resolved).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No active alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Recommendations</span>
                </CardTitle>
                <CardDescription>
                  System optimization suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemHealth ? (
                  <div className="space-y-3">
                    {systemHealth.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 border rounded bg-blue-50">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Recommendation {index + 1}</span>
                        </div>
                        <div className="text-sm text-blue-800 mt-1">{recommendation}</div>
                      </div>
                    ))}
                    {systemHealth.recommendations.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No recommendations at this time
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Loading recommendations...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}