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
  Code, 
  Activity, 
  Settings, 
  Play,
  Rocket,
  FileText,
  BarChart3,
  GitBranch,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";

interface DevTool {
  id: string;
  name: string;
  type: string;
  status: string;
  capabilities: string[];
  languages: string[];
  projects_completed: number;
  avg_quality_score: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  type: string;
  progress: number;
  created_at: string;
  completed_at: string | null;
  quality_score: number | null;
  auto_deployed: boolean;
}

interface DevMetrics {
  total_projects_generated: number;
  avg_development_time: number;
  code_quality_score: number;
  auto_deployment_rate: number;
  bug_reduction_rate: number;
  developer_productivity_gain: number;
  active_development_sessions: number;
}

export default function DevAutonomyLayer() {
  const [tools, setTools] = useState<DevTool[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<DevMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    type: '',
    requirements: '',
    tech_stack: '',
    auto_deploy: false
  });
  const [codeToExecute, setCodeToExecute] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    fetchTools();
    fetchProjects();
    fetchMetrics();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/forge1/dev?action=tools');
      const data = await response.json();
      setTools(data.tools);
    } catch (error) {
      console.error('Error fetching dev tools:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/forge1/dev?action=projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/forge1/dev?action=metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleGenerateProject = async () => {
    if (!newProject.name.trim() || !newProject.type.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_project',
          data: {
            project_name: newProject.name,
            project_type: newProject.type,
            requirements: newProject.requirements.split('\n').filter(r => r.trim()),
            tech_stack: newProject.tech_stack.split(',').map(t => t.trim()),
            auto_deploy: newProject.auto_deploy
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewProject({ name: '', type: '', requirements: '', tech_stack: '', auto_deploy: false });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCode = async () => {
    if (!codeToExecute.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_code',
          data: {
            code: codeToExecute,
            language: codeLanguage
          }
        })
      });
      
      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'code_generation': return <Code className="w-4 h-4" />;
      case 'code_execution': return <Zap className="w-4 h-4" />;
      case 'deployment': return <Rocket className="w-4 h-4" />;
      case 'analysis': return <Target className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'testing': return 'bg-yellow-500';
      case 'planning': return 'bg-orange-500';
      case 'generating': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500 bg-opacity-10">
                <Code className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Dev Autonomy Layer</span>
                  <Badge variant="outline">GPT Engineer + Open Interpreter</Badge>
                </CardTitle>
                <CardDescription>
                  Build tools FOR YOU, not for Forge
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchTools();
                  fetchProjects();
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
              <div className="text-2xl font-bold text-indigo-600">
                {metrics?.total_projects_generated || 0}
              </div>
              <div className="text-sm text-slate-600">Projects Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(metrics?.code_quality_score * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Code Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(metrics?.auto_deployment_rate * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Auto Deploy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(metrics?.developer_productivity_gain * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Productivity Gain</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tools">Dev Tools</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="generator">Project Generator</TabsTrigger>
          <TabsTrigger value="executor">Code Executor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Development Tools</span>
              </CardTitle>
              <CardDescription>
                AI-powered development tools and assistants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tools.map((tool) => (
                  <Card key={tool.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-indigo-100">
                            {getToolIcon(tool.type)}
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
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tool.capabilities.slice(0, 3).map((capability, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{tool.capabilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Projects: {tool.projects_completed}</span>
                              <span>Quality: {(tool.avg_quality_score * 100).toFixed(1)}%</span>
                              <span>Languages: {tool.languages.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Quality</span>
                              <span>{(tool.avg_quality_score * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={tool.avg_quality_score * 100} className="h-1" />
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

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Development Projects</span>
              </CardTitle>
              <CardDescription>
                Track and manage autonomous development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{project.name}</h4>
                              <Badge variant="outline">{project.type}</Badge>
                              <Badge 
                                variant={
                                  project.status === 'completed' ? 'default' :
                                  project.status === 'in_progress' ? 'secondary' :
                                  project.status === 'testing' ? 'outline' : 'destructive'
                                }
                              >
                                {project.status.replace('_', ' ')}
                              </Badge>
                              {project.auto_deployed && (
                                <Badge variant="outline" className="text-green-600">
                                  Auto-deployed
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                              {project.completed_at && (
                                <span>Completed: {new Date(project.completed_at).toLocaleDateString()}</span>
                              )}
                              {project.quality_score && (
                                <span>Quality: {(project.quality_score * 100).toFixed(1)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {project.status !== 'completed' && (
                            <div className="w-24">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-1" />
                            </div>
                          )}
                          {project.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
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

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Project Generator</span>
              </CardTitle>
              <CardDescription>
                Generate complete projects autonomously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    placeholder="Enter project name..."
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Type</label>
                  <Select value={newProject.type} onValueChange={(value) => setNewProject({...newProject, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_app">Web Application</SelectItem>
                      <SelectItem value="api">API Service</SelectItem>
                      <SelectItem value="ml_model">Machine Learning Model</SelectItem>
                      <SelectItem value="data_pipeline">Data Pipeline</SelectItem>
                      <SelectItem value="mobile_app">Mobile Application</SelectItem>
                      <SelectItem value="cli_tool">CLI Tool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements (one per line)</label>
                <Textarea
                  placeholder="Enter project requirements..."
                  value={newProject.requirements}
                  onChange={(e) => setNewProject({...newProject, requirements: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                <Input
                  placeholder="e.g., python, react, postgresql"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({...newProject, tech_stack: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_deploy"
                  checked={newProject.auto_deploy}
                  onChange={(e) => setNewProject({...newProject, auto_deploy: e.target.checked})}
                />
                <label htmlFor="auto_deploy" className="text-sm font-medium">
                  Enable auto-deployment
                </label>
              </div>
              
              <Button
                onClick={handleGenerateProject}
                disabled={isLoading || !newProject.name.trim() || !newProject.type.trim()}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Project'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Code Executor</span>
              </CardTitle>
              <CardDescription>
                Execute code with Open Interpreter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Programming Language</label>
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="bash">Bash</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Execution Environment</label>
                  <Select defaultValue="sandbox">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="container">Container</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Code to Execute</label>
                <Textarea
                  placeholder={`Enter ${codeLanguage} code to execute...`}
                  value={codeToExecute}
                  onChange={(e) => setCodeToExecute(e.target.value)}
                  rows={8}
                />
              </div>
              
              <Button
                onClick={handleExecuteCode}
                disabled={isLoading || !codeToExecute.trim()}
                className="w-full"
              >
                {isLoading ? 'Executing...' : 'Execute Code'}
              </Button>
              
              {executionResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-600">Execution ID: </span><span className="font-medium">{executionResult.execution_id}</span></div>
                      <div><span className="text-slate-600">Language: </span><span className="font-medium">{executionResult.language}</span></div>
                      <div><span className="text-slate-600">Status: </span><span className={`font-medium ${executionResult.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>{executionResult.status}</span></div>
                      <div><span className="text-slate-600">Execution Time: </span><span className="font-medium">{executionResult.execution_time}ms</span></div>
                      <div><span className="text-slate-600">Memory Used: </span><span className="font-medium">{executionResult.memory_used}MB</span></div>
                      <div>
                        <span className="text-slate-600">Output: </span>
                        <pre className="font-medium mt-1 bg-slate-100 p-2 rounded text-xs">
                          {executionResult.output}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Development Analytics</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and development insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Code Quality Score</span>
                      <span className="font-medium">
                        {(metrics?.code_quality_score * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.code_quality_score * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Auto Deployment Rate</span>
                      <span className="font-medium">
                        {(metrics?.auto_deployment_rate * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.auto_deployment_rate * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Development Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Projects Generated: </span>
                      <span className="font-medium">{metrics?.total_projects_generated?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Development Time: </span>
                      <span className="font-medium">{Math.floor((metrics?.avg_development_time || 0) / 60)}m</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Bug Reduction Rate: </span>
                      <span className="font-medium">{(metrics?.bug_reduction_rate * 100 || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Productivity Gain: </span>
                      <span className="font-medium">{(metrics?.developer_productivity_gain * 100 || 0).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Active Sessions: </span>
                      <span className="font-medium">{metrics?.active_development_sessions || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Project generated: Web API Service</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code executed: Python script</span>
                      <span className="text-slate-500">5 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Project deployed: ML Model</span>
                      <span className="text-slate-500">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code reviewed: API endpoints</span>
                      <span className="text-slate-500">30 minutes ago</span>
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