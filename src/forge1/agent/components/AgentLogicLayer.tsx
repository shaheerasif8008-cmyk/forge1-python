"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Activity, 
  Settings, 
  Play, 
  Users,
  Network,
  Target,
  Zap,
  Clock,
  TrendingUp
} from "lucide-react";

interface AgentStatus {
  total: number;
  deployed: number;
  training: number;
  ready: number;
}

interface OrchestrationStatus {
  orchestration_status: string;
  active_workflows: number;
  completed_workflows: number;
  failed_workflows: number;
  avg_workflow_duration: number;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  role: string;
  capabilities: string[];
  status: string;
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    cost_efficiency: number;
    human_comparison: number;
  };
}

export default function AgentLogicLayer() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [orchestrationStatus, setOrchestrationStatus] = useState<OrchestrationStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    agents: [] as string[]
  });
  const [reasoningInput, setReasoningInput] = useState('');
  const [reasoningResult, setReasoningResult] = useState<any>(null);

  useEffect(() => {
    fetchAgentStatus();
    fetchOrchestrationStatus();
    fetchAgents();
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/forge1/agent?action=agents');
      const data = await response.json();
      setAgentStatus(data.summary);
    } catch (error) {
      console.error('Error fetching agent status:', error);
    }
  };

  const fetchOrchestrationStatus = async () => {
    try {
      const response = await fetch('/api/forge1/agent?action=orchestration');
      const data = await response.json();
      setOrchestrationStatus(data);
    } catch (error) {
      console.error('Error fetching orchestration status:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/forge1/agents');
      const data = await response.json();
      setAgents(data.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_agent_workflow',
          data: newWorkflow
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewWorkflow({ name: '', description: '', agents: [] });
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteReasoning = async () => {
    if (!reasoningInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_reasoning',
          data: { input: reasoningInput }
        })
      });
      
      const result = await response.json();
      setReasoningResult(result);
    } catch (error) {
      console.error('Error executing reasoning:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'train_agent',
          data: { agent_id: agentId }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchAgents();
        fetchAgentStatus();
      }
    } catch (error) {
      console.error('Error training agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500 bg-opacity-10">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Agent Logic Layer</span>
                  <Badge variant="outline">AutoGen</Badge>
                </CardTitle>
                <CardDescription>
                  Main reasoning engine + agent orchestration
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={orchestrationStatus?.orchestration_status === 'active' ? 'default' : 'secondary'}>
                {orchestrationStatus?.orchestration_status || 'Unknown'}
              </Badge>
              <Button
                onClick={() => {
                  fetchAgentStatus();
                  fetchOrchestrationStatus();
                }}
                variant="outline"
                size="sm"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {orchestrationStatus?.active_workflows || 0}
              </div>
              <div className="text-sm text-slate-600">Active Workflows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {agentStatus?.deployed || 0}
              </div>
              <div className="text-sm text-slate-600">Deployed Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orchestrationStatus?.completed_workflows || 0}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(orchestrationStatus?.avg_workflow_duration || 0)}s
              </div>
              <div className="text-sm text-slate-600">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
          <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>AI Agents</span>
              </CardTitle>
              <CardDescription>
                Manage and monitor AI agents in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{agent.name}</h4>
                            <Badge variant="outline">{agent.type}</Badge>
                            <Badge 
                              variant={
                                agent.status === 'deployed' ? 'default' :
                                agent.status === 'ready' ? 'secondary' :
                                agent.status === 'training' ? 'outline' : 'destructive'
                              }
                            >
                              {agent.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{agent.role}</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{agent.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm">
                            <span className="text-slate-600">Human Comparison: </span>
                            <span className="font-medium">{(agent.performance.human_comparison * 100).toFixed(0)}%</span>
                          </div>
                          {agent.status === 'ready' && (
                            <Button
                              onClick={() => handleTrainAgent(agent.id)}
                              size="sm"
                              variant="outline"
                            >
                              Train
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="w-5 h-5" />
                <span>Agent Orchestration</span>
              </CardTitle>
              <CardDescription>
                Coordinate multiple agents for complex tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workflow Success Rate</span>
                      <span className="font-medium">
                        {orchestrationStatus ? 
                          Math.round((orchestrationStatus.completed_workflows / 
                          (orchestrationStatus.completed_workflows + orchestrationStatus.failed_workflows)) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={orchestrationStatus ? 
                        (orchestrationStatus.completed_workflows / 
                        (orchestrationStatus.completed_workflows + orchestrationStatus.failed_workflows)) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Load</span>
                      <span className="font-medium">Moderate</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Active Orchestrations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Financial Analysis Workflow</span>
                      <span className="text-slate-500">75% complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal Document Review</span>
                      <span className="text-slate-500">45% complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Research Task</span>
                      <span className="text-slate-500">90% complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasoning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Reasoning Engine</span>
              </CardTitle>
              <CardDescription>
                Execute complex reasoning tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input for Reasoning</label>
                <Textarea
                  placeholder="Enter complex task or problem for reasoning engine..."
                  value={reasoningInput}
                  onChange={(e) => setReasoningInput(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleExecuteReasoning}
                disabled={isLoading || !reasoningInput.trim()}
                className="w-full"
              >
                {isLoading ? 'Reasoning...' : 'Execute Reasoning'}
              </Button>
              
              {reasoningResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reasoning Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Confidence: </span>
                          <span className="font-medium">{(reasoningResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Execution Time: </span>
                          <span className="font-medium">{reasoningResult.execution_time}ms</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Output:</span>
                        <p className="text-sm text-slate-700 mt-1">{reasoningResult.output}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Steps:</span>
                        <ul className="text-sm text-slate-700 mt-1 space-y-1">
                          {reasoningResult.steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Workflow Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage agent workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input
                    placeholder="Enter workflow name..."
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Enter workflow description..."
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Agents</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose agents for workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleCreateWorkflow}
                disabled={isLoading || !newWorkflow.name.trim()}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Workflow'}
              </Button>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Recent Workflows</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Financial Analysis Pipeline</span>
                    <span className="text-green-600">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Legal Document Processing</span>
                    <span className="text-blue-600">Running</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Research Workflow</span>
                    <span className="text-yellow-600">Pending</span>
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