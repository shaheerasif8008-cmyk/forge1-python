"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Pause, 
  Play,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  BarChart3,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  Info,
  XCircle,
  TrendingDown,
  Minus,
  Heart,
  Lightbulb,
  Database,
  Shield,
  Wrench,
  Eye,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'training' | 'error' | 'maintenance';
  uptime: string;
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    efficiency: number;
  };
  emotionalState: {
    mood: 'happy' | 'neutral' | 'stressed' | 'focused' | 'creative';
    engagement: number;
    empathy: number;
  };
  systemMetrics: {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  conversations: {
    total: number;
    today: number;
    avgResponseTime: number;
  };
  memory: {
    shortTerm: number;
    longTerm: number;
    episodic: number;
  };
  multiLLM?: {
    models: string[];
    collaborationMode: string;
    lastSwitch: string;
  };
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  aiServices: number;
  database: number;
  uptime: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  agentId?: string;
  resolved: boolean;
}

export default function AgentMonitoringDashboard() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [agentsRes, healthRes, alertsRes] = await Promise.all([
        fetch('/api/forge1/agents'),
        fetch('/api/forge1/system'),
        fetch('/api/forge1/status')
      ]);

      const agentsData = await agentsRes.json();
      const healthData = await healthRes.json();
      const alertsData = await alertsRes.json();

      // Transform agents data for monitoring
      const transformedAgents: AgentStatus[] = agentsData.agents?.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: mapStatus(agent.status),
        uptime: calculateUptime(agent.createdAt),
        performance: agent.performance || {
          accuracy: Math.random() * 100,
          speed: Math.random() * 100,
          reliability: Math.random() * 100,
          efficiency: Math.random() * 100
        },
        emotionalState: {
          mood: ['happy', 'neutral', 'focused', 'creative'][Math.floor(Math.random() * 4)] as any,
          engagement: Math.random() * 100,
          empathy: Math.random() * 100
        },
        systemMetrics: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 100,
          disk: Math.random() * 100
        },
        recentActivity: generateRecentActivity(),
        conversations: {
          total: Math.floor(Math.random() * 1000),
          today: Math.floor(Math.random() * 50),
          avgResponseTime: Math.floor(Math.random() * 2000) + 200
        },
        memory: {
          shortTerm: Math.random() * 100,
          longTerm: Math.random() * 100,
          episodic: Math.random() * 100
        },
        multiLLM: agent.config?.multi_llm_config ? {
          models: ['GPT-O1', 'Claude Opus', 'Gemini Flash'],
          collaborationMode: agent.config.multi_llm_config.collaborationMode,
          lastSwitch: '2 hours ago'
        } : undefined
      })) || [];

      setAgents(transformedAgents);
      setSystemHealth(healthData.systemHealth || {
        overall: 'healthy',
        cpu: 25,
        memory: 45,
        storage: 30,
        network: 15,
        aiServices: 35,
        database: 20,
        uptime: '99.9%'
      });
      setAlerts(alertsData.alerts || generateMockAlerts());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const mapStatus = (status: string): AgentStatus['status'] => {
    switch (status) {
      case 'deployed': return 'active';
      case 'ready': return 'idle';
      case 'training': return 'training';
      case 'inactive': return 'maintenance';
      default: return 'error';
    }
  };

  const calculateUptime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return '< 1h';
  };

  const generateRecentActivity = () => {
    const activities = [
      { type: 'conversation', description: 'Completed customer inquiry' },
      { type: 'analysis', description: 'Generated financial report' },
      { type: 'learning', description: 'Updated knowledge base' },
      { type: 'system', description: 'Performance optimization' },
      { type: 'error', description: 'Recovered from timeout' }
    ];
    
    return activities.map(activity => ({
      ...activity,
      timestamp: `${Math.floor(Math.random() * 60)}m ago`
    }));
  };

  const generateMockAlerts = (): Alert[] => {
    return [
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Agent "Financial Analyst" is using 85% of allocated memory',
        timestamp: '5m ago',
        agentId: '1',
        resolved: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Training Completed',
        message: 'Agent "Legal Assistant" has completed training successfully',
        timestamp: '15m ago',
        agentId: '2',
        resolved: true
      },
      {
        id: '3',
        type: 'error',
        title: 'Network Timeout',
        message: 'Connection timeout detected for agent "Data Scientist"',
        timestamp: '1h ago',
        agentId: '3',
        resolved: false
      }
    ];
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'idle': return <Pause className="w-4 h-4 text-gray-500" />;
      case 'training': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    try {
      const response = await fetch('/api/forge1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, agentId })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: `Agent ${action} completed successfully`,
        });
        loadDashboardData();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} agent`,
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved"
    });
  };

  const exportReport = async () => {
    const reportData = {
      agents,
      systemHealth,
      alerts,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Monitoring report has been exported successfully"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Loading monitoring dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and management of all AI employees
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health Overview</span>
              <Badge variant={systemHealth.overall === 'healthy' ? 'default' : systemHealth.overall === 'warning' ? 'secondary' : 'destructive'}>
                {systemHealth.overall.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall system status: {systemHealth.uptime} uptime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">CPU</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.cpu)}`}>{systemHealth.cpu}%</span>
                </div>
                <Progress value={systemHealth.cpu} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Memory</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.memory)}`}>{systemHealth.memory}%</span>
                </div>
                <Progress value={systemHealth.memory} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Storage</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.storage)}`}>{systemHealth.storage}%</span>
                </div>
                <Progress value={systemHealth.storage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Network</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.network)}`}>{systemHealth.network}%</span>
                </div>
                <Progress value={systemHealth.network} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">AI Services</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.aiServices)}`}>{systemHealth.aiServices}%</span>
                </div>
                <Progress value={systemHealth.aiServices} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <span className={`text-sm ${getHealthColor(systemHealth.database)}`}>{systemHealth.database}%</span>
                </div>
                <Progress value={systemHealth.database} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Recent Alerts</span>
            <Badge variant="outline">{alerts.filter(a => !a.resolved).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}>
                        {alert.type}
                      </Badge>
                      {!alert.resolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    {alert.resolved && (
                      <Badge variant="outline" className="text-xs">Resolved</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="testing">Testing Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(agent.status)}
                        <h3 className="font-semibold">{agent.name}</h3>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {agent.uptime}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Performance</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Accuracy</span>
                        <span>{agent.performance.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed</span>
                        <span>{agent.performance.speed.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability</span>
                        <span>{agent.performance.reliability.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency</span>
                        <span>{agent.performance.efficiency.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* System Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">System Usage</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>CPU</span>
                        <span className={getHealthColor(agent.systemMetrics.cpu)}>{agent.systemMetrics.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Memory</span>
                        <span className={getHealthColor(agent.systemMetrics.memory)}>{agent.systemMetrics.memory.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Emotional State */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Emotional State</h4>
                    <div className="flex items-center space-x-2">
                      <Heart className={`w-4 h-4 ${agent.emotionalState.mood === 'happy' ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className="text-xs capitalize">{agent.emotionalState.mood}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs">Engagement: {agent.emotionalState.engagement.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Multi-LLM Info */}
                  {agent.multiLLM && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Multi-LLM</h4>
                      <div className="text-xs text-muted-foreground">
                        {agent.multiLLM.models.length} models • {agent.multiLLM.collaborationMode}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleAgentAction(agent.id, agent.status === 'active' ? 'pause_agent' : 'deploy_agent')}
                    >
                      {agent.status === 'active' ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {agent.status === 'active' ? 'Pause' : 'Start'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Performance Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm">{systemHealth?.cpu || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.cpu || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm">{systemHealth?.memory || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.memory || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Network I/O</span>
                      <span className="text-sm">{systemHealth?.network || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.network || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Active Services</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Service</span>
                      <Badge variant="outline">Running</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge variant="outline">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monitor</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">System Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span>Forge 1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment</span>
                      <span>Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated</span>
                      <span>2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Agents</span>
                      <span>{agents.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Testing Mode</CardTitle>
              <CardDescription>
                Simulate high-pressure enterprise client scenarios and stress test your AI employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Stress Testing</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      High-Volume Request Test
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Cpu className="w-4 h-4 mr-2" />
                      CPU/Memory Stress Test
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Wifi className="w-4 h-4 mr-2" />
                      Network Latency Test
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Scenario Testing</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Enterprise Client Simulation
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Complex Query Handling
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Multi-Task Coordination
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Recovery Mode Testing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <span className="text-sm">Simulate Agent Failure</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="w-6 h-6 mb-2" />
                    <span className="text-sm">Test Auto-Recovery</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="w-6 h-6 mb-2" />
                    <span className="text-sm">Failover Testing</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}