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
  Cloud, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Database,
  Users,
  FileText,
  Workflow,
  Plus,
  Calendar,
  Activity,
  Building2,
  BarChart3,
  MessageSquare,
  CreditCard,
  Projector,
  Mail
} from "lucide-react";
import { SaaSAgentsService, SaaSAgent, SaaSTask, SaaSWorkflow } from "../service";

const saasAgentsService = new SaaSAgentsService();

export default function SaaSAgentsDashboard() {
  const [agents, setAgents] = useState<SaaSAgent[]>([]);
  const [tasks, setTasks] = useState<SaaSTask[]>([]);
  const [workflows, setWorkflows] = useState<SaaSWorkflow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SaaSAgent | null>(null);
  const [selectedTask, setSelectedTask] = useState<SaaSTask | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SaaSWorkflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Form states
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState<SaaSAgent['saas_type']>('crm');
  const [agentDescription, setAgentDescription] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    loadAgents();
    loadTasks();
    loadWorkflows();
  }, []);

  const loadAgents = async () => {
    // In production, load from API
    const mockAgents: SaaSAgent[] = [
      {
        id: "saas_1",
        name: "Salesforce CRM Agent",
        saas_type: "crm",
        description: "AI-powered Salesforce automation agent",
        status: "active",
        config: {
          auth_method: "oauth",
          settings: { instance: "mycompany" }
        },
        capabilities: [],
        integrations: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setAgents(mockAgents);
  };

  const loadTasks = async () => {
    // In production, load from API
    const mockTasks: SaaSTask[] = [
      {
        id: "task_1",
        agent_id: "saas_1",
        task_type: "data_sync",
        name: "Daily Contact Sync",
        description: "Sync contacts from external system",
        config: { source: "external", target: "salesforce" },
        status: "completed",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setTasks(mockTasks);
  };

  const loadWorkflows = async () => {
    // In production, load from API
    const mockWorkflows: SaaSWorkflow[] = [
      {
        id: "workflow_1",
        name: "Lead Processing Workflow",
        description: "Process new leads from multiple sources",
        agents: ["saas_1"],
        steps: [],
        triggers: [],
        status: "active",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const handleCreateAgent = async () => {
    if (!agentName || !agentDescription) return;

    setIsCreating(true);
    try {
      const newAgent = await saasAgentsService.createSaaSAgent({
        name: agentName,
        saas_type: agentType,
        description: agentDescription,
        config: {
          auth_method: 'api_key',
          settings: {},
          api_endpoint: apiEndpoint,
          api_key: apiKey
        }
      });

      setAgents(prev => [...prev, newAgent]);
      setAgentName("");
      setAgentDescription("");
      setApiEndpoint("");
      setApiKey("");
    } catch (error) {
      console.error('Failed to create SaaS agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteTask = async () => {
    if (!selectedTask) return;

    setIsExecuting(true);
    try {
      const executedTask = await saasAgentsService.executeTask(selectedTask);
      setTasks(prev => 
        prev.map(task => task.id === selectedTask.id ? executedTask : task)
      );
      setSelectedTask(executedTask);
    } catch (error) {
      console.error('Failed to execute task:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getSaaSTypeIcon = (type: string) => {
    switch (type) {
      case 'crm':
        return <Users className="w-4 h-4" />;
      case 'erp':
        return <Building2 className="w-4 h-4" />;
      case 'hrm':
        return <Users className="w-4 h-4" />;
      case 'marketing':
        return <BarChart3 className="w-4 h-4" />;
      case 'finance':
        return <CreditCard className="w-4 h-4" />;
      case 'project_management':
        return <Projector className="w-4 h-4" />;
      case 'communication':
        return <MessageSquare className="w-4 h-4" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
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
      case 'configuring':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'data_sync':
        return <RefreshCw className="w-4 h-4" />;
      case 'process_automation':
        return <Zap className="w-4 h-4" />;
      case 'report_generation':
        return <FileText className="w-4 h-4" />;
      case 'notification':
        return <MessageSquare className="w-4 h-4" />;
      case 'custom':
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SaaS-as-Agent Architecture</h2>
          <p className="text-muted-foreground">
            Each SaaS application is an AI employee instance
          </p>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">SaaS Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create SaaS Agent</span>
                </CardTitle>
                <CardDescription>
                  Create a new AI-powered SaaS agent instance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agentType">SaaS Type</Label>
                  <Select value={agentType} onValueChange={(value: any) => setAgentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>CRM (Customer Relationship)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="erp">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>ERP (Enterprise Resource)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hrm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>HRM (Human Resource)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>Marketing Automation</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="finance">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Finance & Accounting</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="project_management">
                        <div className="flex items-center space-x-2">
                          <Projector className="w-4 h-4" />
                          <span>Project Management</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="communication">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Communication</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="analytics">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics & BI</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="agentDescription">Description</Label>
                  <Textarea
                    id="agentDescription"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Describe the SaaS agent's purpose"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="https://api.saas-service.com"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    type="password"
                  />
                </div>

                <Button 
                  onClick={handleCreateAgent} 
                  disabled={isCreating || !agentName || !agentDescription}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create SaaS Agent"}
                </Button>
              </CardContent>
            </Card>

            {/* Agents List */}
            <Card>
              <CardHeader>
                <CardTitle>SaaS Agents</CardTitle>
                <CardDescription>
                  Active SaaS AI employee instances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSaaSTypeIcon(agent.saas_type)}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent.status)}
                          <Badge variant="outline">{agent.saas_type.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{agent.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agent.capabilities.length} capabilities • {agent.integrations.length} integrations
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execute Task */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Execute Task</span>
                </CardTitle>
                <CardDescription>
                  Run automated tasks on SaaS agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Task</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedTask ? (
                      <div>
                        <div className="font-medium">{selectedTask.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTask.task_type} • {selectedTask.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Agent: {agents.find(a => a.id === selectedTask.agent_id)?.name || 'Unknown'}
                        </div>
                      </div>
                    ) : (
                      "No task selected"
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleExecuteTask} 
                  disabled={isExecuting || !selectedTask || selectedTask.status === 'running'}
                  className="w-full"
                >
                  {isExecuting ? "Executing..." : "Execute Task"}
                </Button>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Tasks</CardTitle>
                <CardDescription>
                  Scheduled and on-demand SaaS tasks
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
                          {getTaskTypeIcon(task.task_type)}
                          <span className="font-medium">{task.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <Badge variant="outline">{task.task_type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{task.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.created_at.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Workflow className="w-5 h-5" />
                  <span>Workflow Details</span>
                </CardTitle>
                <CardDescription>
                  Multi-agent workflow orchestration
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
                        <div className="text-sm text-muted-foreground">Steps</div>
                        <div className="font-medium">{selectedWorkflow.steps.length}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Agents</div>
                      <div className="space-y-1">
                        {selectedWorkflow.agents.map(agentId => {
                          const agent = agents.find(a => a.id === agentId);
                          return agent ? (
                            <div key={agentId} className="flex items-center space-x-2 text-sm">
                              {getSaaSTypeIcon(agent.saas_type)}
                              <span>{agent.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Triggers</div>
                      <div className="space-y-1">
                        {selectedWorkflow.triggers.map(trigger => (
                          <div key={trigger.id} className="text-sm">
                            {trigger.type} {trigger.active ? '(Active)' : '(Inactive)'}
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

            {/* Workflows List */}
            <Card>
              <CardHeader>
                <CardTitle>SaaS Workflows</CardTitle>
                <CardDescription>
                  Cross-agent automation workflows
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
                            {workflow.agents.length} agents
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{workflow.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {workflow.steps.length} steps • {workflow.triggers.length} triggers
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Execution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Task Execution</span>
                </CardTitle>
                <CardDescription>
                  Real-time task execution monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedTask.status)}
                          <span className="font-medium capitalize">{selectedTask.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="flex items-center space-x-2">
                          {getTaskTypeIcon(selectedTask.task_type)}
                          <span className="font-medium">{selectedTask.task_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Description</div>
                      <div className="text-sm">{selectedTask.description}</div>
                    </div>

                    {selectedTask.result && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Result</div>
                        <div className="text-xs bg-gray-50 p-2 rounded">
                          {JSON.stringify(selectedTask.result, null, 2)}
                        </div>
                      </div>
                    )}

                    {selectedTask.error && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Error</div>
                        <div className="text-sm text-red-600">{selectedTask.error}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-500">Created:</div>
                        <div>{selectedTask.created_at.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Updated:</div>
                        <div>{selectedTask.updated_at.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a task to view execution details
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Agent Performance</span>
                </CardTitle>
                <CardDescription>
                  SaaS agent performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {agents.filter(a => a.status === 'active').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tasks.filter(t => t.status === 'completed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed Tasks</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Task Success Rate</span>
                      <span className="font-medium">
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {tasks.filter(t => t.status === 'pending').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {tasks.filter(t => t.status === 'running').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Running</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {tasks.filter(t => t.status === 'failed').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Agent Types Distribution</div>
                    <div className="space-y-1">
                      {['crm', 'erp', 'hrm', 'marketing', 'finance'].map(type => {
                        const count = agents.filter(a => a.saas_type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              {getSaaSTypeIcon(type)}
                              <span className="uppercase">{type}</span>
                            </div>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}