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
  Bot, 
  Database, 
  Workflow, 
  Network, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Settings,
  Code,
  Zap,
  Activity,
  Plus,
  FileText,
  Users,
  Server
} from "lucide-react";
import { APIWorkerService, APIWorkerAgent, ExecutionSession, WorkflowStep } from "../service";

const apiWorkerService = new APIWorkerService();

export default function APIWorkersDashboard() {
  const [agents, setAgents] = useState<APIWorkerAgent[]>([]);
  const [sessions, setSessions] = useState<ExecutionSession[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<APIWorkerAgent | null>(null);
  const [selectedSession, setSelectedSession] = useState<ExecutionSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Form states
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentType, setAgentType] = useState<"n8n" | "supabase" | "auto_gen" | "langgraph">("n8n");
  const [inputData, setInputData] = useState("{}");

  useEffect(() => {
    loadAgents();
    loadSessions();
  }, []);

  const loadAgents = async () => {
    // In production, load from API
    const mockAgents: APIWorkerAgent[] = [
      {
        id: "agent_1",
        name: "Data Processing Pipeline",
        description: "N8N workflow for data processing and transformation",
        type: "n8n",
        status: "idle",
        config: {
          n8nConfig: {
            webhookUrl: "https://n8n.example.com/webhook/data-processing"
          }
        },
        workflow: [
          {
            id: "step_1",
            type: "api_call",
            name: "Fetch Data",
            config: { url: "https://api.example.com/data", method: "GET" },
            status: "pending"
          },
          {
            id: "step_2",
            type: "ai_processing",
            name: "Process Data",
            config: { prompt: "Analyze the following data: {{data}}" },
            status: "pending"
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setAgents(mockAgents);
  };

  const loadSessions = async () => {
    // In production, load from API
    const mockSessions: ExecutionSession[] = [
      {
        id: "session_1",
        agent_id: "agent_1",
        input_data: { source: "api", format: "json" },
        output_data: { processed: true, count: 100 },
        status: "completed",
        current_step: 2,
        steps: [],
        logs: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setSessions(mockSessions);
  };

  const handleCreateAgent = async () => {
    if (!agentName || !agentDescription) return;

    setIsCreating(true);
    try {
      const config = this.getAgentConfig(agentType);
      
      const workflow = this.getDefaultWorkflow(agentType);
      
      const newAgent = await apiWorkerService.createAgent({
        name: agentName,
        description: agentDescription,
        type: agentType,
        config,
        workflow
      });

      setAgents(prev => [...prev, newAgent]);
      setAgentName("");
      setAgentDescription("");
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteAgent = async () => {
    if (!selectedAgent) return;

    setIsExecuting(true);
    try {
      const parsedInputData = JSON.parse(inputData);
      const newSession = await apiWorkerService.executeAgent(selectedAgent.id, parsedInputData);
      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
    } catch (error) {
      console.error('Failed to execute agent:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getAgentConfig = (type: string) => {
    switch (type) {
      case 'n8n':
        return {
          n8nConfig: {
            webhookUrl: "",
            credentials: {}
          }
        };
      case 'supabase':
        return {
          database: "",
          schema: "public"
        };
      case 'auto_gen':
        return {
          autoGenConfig: {
            agents: [
              {
                name: "assistant",
                role: "Assistant",
                model: "gpt-4",
                system_message: "You are a helpful assistant."
              }
            ],
            max_rounds: 5
          }
        };
      case 'langgraph':
        return {
          graphConfig: {
            nodes: [
              {
                id: "start",
                type: "agent",
                name: "Start Node",
                config: { prompt: "Process the input data" }
              }
            ],
            edges: [],
            entryPoint: "start"
          }
        };
      default:
        return {};
    }
  };

  const getDefaultWorkflow = (type: string): WorkflowStep[] => {
    switch (type) {
      case 'n8n':
        return [
          {
            id: "step_1",
            type: "api_call",
            name: "Webhook Trigger",
            config: { url: "{{webhook_url}}", method: "POST" },
            status: "pending"
          }
        ];
      case 'supabase':
        return [
          {
            id: "step_1",
            type: "database_query",
            name: "Database Query",
            config: { operation: "select", table: "data" },
            status: "pending"
          }
        ];
      case 'auto_gen':
        return [
          {
            id: "step_1",
            type: "ai_processing",
            name: "Multi-Agent Processing",
            config: { prompt: "Process with multiple agents" },
            status: "pending"
          }
        ];
      case 'langgraph':
        return [
          {
            id: "step_1",
            type: "ai_processing",
            name: "Graph Execution",
            config: { prompt: "Execute graph workflow" },
            status: "pending"
          }
        ];
      default:
        return [];
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'n8n':
        return <Workflow className="w-4 h-4" />;
      case 'supabase':
        return <Database className="w-4 h-4" />;
      case 'auto_gen':
        return <Users className="w-4 h-4" />;
      case 'langgraph':
        return <Network className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'api_call':
        return <Server className="w-4 h-4" />;
      case 'database_query':
        return <Database className="w-4 h-4" />;
      case 'ai_processing':
        return <Bot className="w-4 h-4" />;
      case 'condition':
        return <Code className="w-4 h-4" />;
      case 'parallel':
        return <Activity className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Worker Agents</h2>
          <p className="text-muted-foreground">
            Advanced workflow automation with N8N, Supabase, AutoGen, and LangGraph
          </p>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Worker Agents</TabsTrigger>
          <TabsTrigger value="execution">Execution Sessions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Worker Agent</span>
                </CardTitle>
                <CardDescription>
                  Define a new API worker agent with workflow automation
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
                  <Label htmlFor="agentDescription">Description</Label>
                  <Textarea
                    id="agentDescription"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Describe the agent's purpose"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="agentType">Agent Type</Label>
                  <Select value={agentType} onValueChange={(value: any) => setAgentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n8n">
                        <div className="flex items-center space-x-2">
                          <Workflow className="w-4 h-4" />
                          <span>N8N Workflow</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="supabase">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4" />
                          <span>Supabase Database</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="auto_gen">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>AutoGen Multi-Agent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="langgraph">
                        <div className="flex items-center space-x-2">
                          <Network className="w-4 h-4" />
                          <span>LangGraph</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateAgent} 
                  disabled={isCreating || !agentName || !agentDescription}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Agent"}
                </Button>
              </CardContent>
            </Card>

            {/* Agents List */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Agents</CardTitle>
                <CardDescription>
                  Select an agent to execute or monitor
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
                          {getAgentTypeIcon(agent.type)}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent.status)}
                          <Badge variant="outline">{agent.type}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{agent.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agent.workflow.length} workflow steps
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execute Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Execute Agent</span>
                </CardTitle>
                <CardDescription>
                  Run the selected agent with input data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Agent</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedAgent ? (
                      <div>
                        <div className="font-medium">{selectedAgent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {selectedAgent.type} • Status: {selectedAgent.status}
                        </div>
                      </div>
                    ) : (
                      "No agent selected"
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="inputData">Input Data (JSON)</Label>
                  <Textarea
                    id="inputData"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={handleExecuteAgent} 
                  disabled={isExecuting || !selectedAgent}
                  className="w-full"
                >
                  {isExecuting ? "Executing..." : "Execute Agent"}
                </Button>
              </CardContent>
            </Card>

            {/* Execution Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Sessions</CardTitle>
                <CardDescription>
                  View and monitor execution sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session.status)}
                          <span className="font-medium">Session {session.id.slice(-8)}</span>
                        </div>
                        <Badge variant="outline">{session.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.current_step}/{session.steps.length} steps • {session.created_at.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Agent: {agents.find(a => a.id === session.agent_id)?.name || 'Unknown'}
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
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Session Details</span>
                </CardTitle>
                <CardDescription>
                  Detailed view of execution session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedSession.status)}
                          <span className="font-medium">{selectedSession.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-medium">
                          {selectedSession.current_step}/{selectedSession.steps.length} steps
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Input Data</div>
                      <Textarea
                        value={JSON.stringify(selectedSession.input_data, null, 2)}
                        readOnly
                        rows={4}
                        className="text-xs"
                      />
                    </div>

                    {selectedSession.output_data && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Output Data</div>
                        <Textarea
                          value={JSON.stringify(selectedSession.output_data, null, 2)}
                          readOnly
                          rows={4}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a session to view details
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Execution Logs</span>
                </CardTitle>
                <CardDescription>
                  Real-time execution logs and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSession.logs.map((log, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge 
                            variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {log.level}
                          </Badge>
                        </div>
                        <div>{log.message}</div>
                        {log.data && (
                          <div className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(log.data, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a session to view logs
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