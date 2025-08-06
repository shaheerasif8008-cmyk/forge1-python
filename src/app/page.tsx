"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MainLayout from "@/components/MainLayout";
import CreateAIEmployee from "@/components/CreateAIEmployee";
import CreateAIEmployeeAdvanced from "@/components/CreateAIEmployeeAdvanced";
import ManageAIEmployees from "@/components/ManageAIEmployees";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import AgentMonitoringDashboard from "@/components/AgentMonitoringDashboard";
import { 
  Cpu, 
  Zap, 
  Database, 
  Brain, 
  Network, 
  Image, 
  Code, 
  Monitor, 
  Shield,
  Activity,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Lightbulb
} from "lucide-react";

// Mock data for dashboard
const systemMetrics = {
  totalAgents: 12,
  activeAgents: 10,
  totalConversations: 1247,
  averageResponseTime: 850,
  systemUptime: 99.8,
  healthScore: 98
};

const recentActivities = [
  {
    id: 1,
    type: "agent_created",
    agentName: "Financial Analyst Pro",
    user: "John Doe",
    timestamp: "2 minutes ago",
    status: "success"
  },
  {
    id: 2,
    type: "task_completed",
    agentName: "Legal Assistant",
    task: "Contract Review",
    user: "Sarah Smith",
    timestamp: "15 minutes ago",
    status: "success"
  },
  {
    id: 3,
    type: "system_update",
    description: "Multi-LLM features deployed",
    timestamp: "1 hour ago",
    status: "success"
  },
  {
    id: 4,
    type: "agent_training",
    agentName: "Data Scientist",
    user: "Mike Johnson",
    timestamp: "2 hours ago",
    status: "in_progress"
  }
];

const performanceMetrics = [
  {
    title: "Agent Performance",
    value: 94,
    change: 2.5,
    icon: Brain,
    color: "text-blue-600"
  },
  {
    title: "Task Completion",
    value: 87,
    change: -1.2,
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Response Time",
    value: 850,
    unit: "ms",
    change: -45,
    icon: Clock,
    color: "text-purple-600"
  },
  {
    title: "System Health",
    value: 98,
    unit: "%",
    change: 0.5,
    icon: Activity,
    color: "text-emerald-600"
  }
];

const systemLayers = [
  {
    id: "interface",
    name: "Interface/API",
    icon: Monitor,
    tech: "FastAPI + Web UI",
    description: "Human interface + API calls",
    status: "active",
    progress: 85,
    color: "bg-blue-500"
  },
  {
    id: "agent",
    name: "Agent Logic",
    icon: Brain,
    tech: "Multi-LLM System",
    description: "Advanced reasoning with model collaboration",
    status: "active",
    progress: 92,
    color: "bg-purple-500"
  },
  {
    id: "actions",
    name: "Actions/Tools",
    icon: Zap,
    tech: "LangChain + Custom Tools",
    description: "Execution of API calls, file I/O, code",
    status: "active",
    progress: 78,
    color: "bg-yellow-500"
  },
  {
    id: "rag",
    name: "RAG",
    icon: Network,
    tech: "Vector Database + LLM",
    description: "Advanced Retrieval-Augmented Generation",
    status: "active",
    progress: 88,
    color: "bg-green-500"
  }
];

export default function Home() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<"running" | "paused">("running");

  const toggleSystemStatus = () => {
    setSystemStatus(systemStatus === "running" ? "paused" : "running");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, John</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your AI workforce today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button size="sm" onClick={() => {
              const tabsList = document.querySelector('[value="employees"]');
              if (tabsList) {
                (tabsList as HTMLElement).click();
              }
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create AI Employee
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold">
                      {metric.value}
                      {metric.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>}
                    </div>
                    {metric.change !== undefined && (
                      <div className={`flex items-center text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getChangeIcon(metric.change)}
                        {Math.abs(metric.change)}%
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">AI Employees</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Status */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>System Status</span>
                    </div>
                    <Badge variant={systemStatus === "running" ? "default" : "secondary"}>
                      {systemStatus === "running" ? "Running" : "Paused"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Real-time system health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{systemMetrics.totalAgents}</div>
                      <div className="text-sm text-muted-foreground">Total Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{systemMetrics.activeAgents}</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{systemMetrics.systemUptime}%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{systemMetrics.healthScore}</div>
                      <div className="text-sm text-muted-foreground">Health Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>System Performance</span>
                      <span className="font-medium">{systemMetrics.healthScore}%</span>
                    </div>
                    <Progress value={systemMetrics.healthScore} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemLayers.slice(0, 4).map((layer) => {
                      const IconComponent = layer.icon;
                      return (
                        <div key={layer.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className={`p-2 rounded-lg ${layer.color} bg-opacity-10`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{layer.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {layer.progress}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{layer.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>
                    Latest system events and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {activity.type === 'agent_created' && (
                            <>Created AI employee <span className="font-medium">{activity.agentName}</span></>
                          )}
                          {activity.type === 'task_completed' && (
                            <><span className="font-medium">{activity.agentName}</span> completed {activity.task}</>
                          )}
                          {activity.type === 'system_update' && (
                            <>{activity.description}</>
                          )}
                          {activity.type === 'agent_training' && (
                            <>Training <span className="font-medium">{activity.agentName}</span></>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {activity.user && `by ${activity.user} • `}
                            {activity.timestamp}
                          </p>
                          {activity.status === 'in_progress' && (
                            <Badge variant="secondary" className="text-xs">In Progress</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <CreateAIEmployeeAdvanced />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <AgentMonitoringDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Health & Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time system metrics and resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm">{systemMetrics.healthScore}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm">{(systemMetrics.healthScore * 0.8).toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore * 0.8} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Storage Usage</span>
                        <span className="text-sm">{(systemMetrics.healthScore * 0.6).toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore * 0.6} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Network</span>
                        <span className="text-sm">{(systemMetrics.healthScore * 0.4).toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore * 0.4} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Database</span>
                        <span className="text-sm">{(systemMetrics.healthScore * 0.7).toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore * 0.7} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">AI Services</span>
                        <span className="text-sm">{(systemMetrics.healthScore * 0.9).toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.healthScore * 0.9} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>System Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Active system components and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {systemLayers.map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${layer.color} bg-opacity-10`}>
                            <layer.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center space-x-2 text-lg">
                              <span>{layer.name}</span>
                              <Badge variant="outline">{layer.tech}</Badge>
                            </CardTitle>
                            <CardDescription>{layer.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{layer.progress}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                          </div>
                          <Badge 
                            variant={layer.status === "active" ? "default" : "secondary"}
                          >
                            {layer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>System Logs</span>
                  </CardTitle>
                  <CardDescription>
                    Recent system events and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            {activity.type === 'agent_created' && (
                              <>Created AI employee <span className="font-medium">{activity.agentName}</span></>
                            )}
                            {activity.type === 'task_completed' && (
                              <><span className="font-medium">{activity.agentName}</span> completed {activity.task}</>
                            )}
                            {activity.type === 'system_update' && (
                              <>{activity.description}</>
                            )}
                            {activity.type === 'agent_training' && (
                              <>Training <span className="font-medium">{activity.agentName}</span></>
                            )}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {activity.user && `by ${activity.user} • `}
                              {activity.timestamp}
                            </p>
                            {activity.status === 'in_progress' && (
                              <Badge variant="secondary" className="text-xs">In Progress</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Complete history of system events and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium">
                            {activity.type === 'agent_created' && `Created ${activity.agentName}`}
                            {activity.type === 'task_completed' && `${activity.agentName} completed ${activity.task}`}
                            {activity.type === 'system_update' && activity.description}
                            {activity.type === 'agent_training' && `Training ${activity.agentName}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.user && `by ${activity.user} • `}
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                        {activity.status === 'success' ? 'Completed' : activity.status === 'in_progress' ? 'In Progress' : 'Error'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}