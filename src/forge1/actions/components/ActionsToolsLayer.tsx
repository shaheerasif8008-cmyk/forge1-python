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
  Zap, 
  Activity, 
  Settings, 
  Play, 
  Pause,
  Tool,
  Code,
  Database,
  Globe,
  Calculator,
  TrendingUp,
  Clock
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  usage_count: number;
}

interface ToolMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  tools_usage: Record<string, number>;
}

export default function ActionsToolsLayer() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [metrics, setMetrics] = useState<ToolMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    type: 'custom'
  });

  useEffect(() => {
    fetchTools();
    fetchMetrics();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/forge1/actions?action=tools');
      const data = await response.json();
      setTools(data.tools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/forge1/actions?action=metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedTool || !toolInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_tool',
          tool: selectedTool,
          data: { input: toolInput }
        })
      });
      
      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing tool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterTool = async () => {
    if (!newTool.name.trim() || !newTool.description.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_tool',
          data: newTool
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewTool({ name: '', description: '', type: 'custom' });
        fetchTools();
      }
    } catch (error) {
      console.error('Error registering tool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (toolName: string) => {
    if (toolName.includes('search') || toolName.includes('web')) return <Globe className="w-4 h-4" />;
    if (toolName.includes('calc') || toolName.includes('math')) return <Calculator className="w-4 h-4" />;
    if (toolName.includes('file') || toolName.includes('io')) return <Database className="w-4 h-4" />;
    if (toolName.includes('code') || toolName.includes('exec')) return <Code className="w-4 h-4" />;
    return <Tool className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-500 bg-opacity-10">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Actions/Tools Layer</span>
                  <Badge variant="outline">LangChain tools + custom tools</Badge>
                </CardTitle>
                <CardDescription>
                  Execution of API calls, file I/O, code, etc
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchTools();
                  fetchMetrics();
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
              <div className="text-2xl font-bold text-yellow-600">
                {metrics?.total_executions || 0}
              </div>
              <div className="text-sm text-slate-600">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics?.successful_executions || 0}
              </div>
              <div className="text-sm text-slate-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics?.failed_executions || 0}
              </div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.avg_execution_time || 0}ms
              </div>
              <div className="text-sm text-slate-600">Avg Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
          <TabsTrigger value="execution">Tool Execution</TabsTrigger>
          <TabsTrigger value="register">Register Tool</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tool className="w-5 h-5" />
                <span>Available Tools</span>
              </CardTitle>
              <CardDescription>
                Browse and manage available LangChain and custom tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tools.map((tool) => (
                  <Card key={tool.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            {getToolIcon(tool.name)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{tool.name}</h4>
                              <Badge variant="outline">{tool.type}</Badge>
                              <Badge 
                                variant={tool.status === 'active' ? 'default' : 'secondary'}
                              >
                                {tool.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{tool.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{tool.usage_count}</div>
                          <div className="text-xs text-slate-500">uses</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Tool Execution</span>
              </CardTitle>
              <CardDescription>
                Execute tools with custom inputs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Tool</label>
                  <Select value={selectedTool} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tool to execute" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tool Input</label>
                  <Textarea
                    placeholder="Enter input for the selected tool..."
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleExecuteTool}
                disabled={isLoading || !selectedTool || !toolInput.trim()}
                className="w-full"
              >
                {isLoading ? 'Executing...' : 'Execute Tool'}
              </Button>
              
              {executionResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Execution ID: </span>
                          <span className="font-medium">{executionResult.execution_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Execution Time: </span>
                          <span className="font-medium">{executionResult.execution_time}ms</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Status: </span>
                          <span className={`font-medium ${
                            executionResult.status === 'completed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {executionResult.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Tool: </span>
                          <span className="font-medium">{executionResult.tool}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Output:</span>
                        <p className="text-sm text-slate-700 mt-1">{executionResult.output}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Register New Tool</span>
              </CardTitle>
              <CardDescription>
                Create and register custom tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tool Name</label>
                  <Input
                    placeholder="Enter tool name..."
                    value={newTool.name}
                    onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tool Type</label>
                  <Select value={newTool.type} onValueChange={(value) => setNewTool({...newTool, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="langchain">LangChain</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what this tool does..."
                  value={newTool.description}
                  onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Button
                onClick={handleRegisterTool}
                disabled={isLoading || !newTool.name.trim() || !newTool.description.trim()}
                className="w-full"
              >
                {isLoading ? 'Registering...' : 'Register Tool'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Tool Analytics</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and usage analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {metrics ? Math.round((metrics.successful_executions / metrics.total_executions) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics ? (metrics.successful_executions / metrics.total_executions) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Execution Time</span>
                      <span className="font-medium">{metrics?.avg_execution_time || 0}ms</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Tool Usage Distribution</h4>
                  <div className="space-y-3">
                    {metrics && Object.entries(metrics.tools_usage).map(([tool, usage]) => (
                      <div key={tool} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{tool.replace('_', ' ')}</span>
                          <span className="font-medium">{usage}</span>
                        </div>
                        <Progress 
                          value={(usage / Math.max(...Object.values(metrics.tools_usage))) * 100} 
                          className="h-1" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Executions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Web Search Tool</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculator Tool</span>
                      <span className="text-slate-500">5 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File I/O Tool</span>
                      <span className="text-slate-500">8 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Caller Tool</span>
                      <span className="text-slate-500">12 minutes ago</span>
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