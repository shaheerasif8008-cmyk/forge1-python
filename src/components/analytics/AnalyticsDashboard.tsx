'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bot, 
  MessageSquare, 
  Zap, 
  Activity,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { analyticsService, AnalyticsReport } from '@/lib/analytics-service';

export default function AnalyticsDashboard() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadReport();
  }, [timeRange]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.generateReport(timeRange);
      setReport(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const data = await analyticsService.exportReport(format);
      
      // Create download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your AI workforce</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button onClick={loadReport} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex space-x-1">
            <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => handleExport('json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.overview.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {report.overview.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.overview.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {report.overview.averageResponseTime.toFixed(0)}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Executions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.overview.totalToolExecutions}</div>
            <p className="text-xs text-muted-foreground">
              {report.overview.toolSuccessRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getSystemHealthIcon(report.systemHealth.status)}
              <span className={`text-2xl font-bold ${getSystemHealthColor(report.systemHealth.status)}`}>
                {report.systemHealth.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {report.overview.systemUptime.toFixed(1)}% uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="tools">Tool Usage</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis of your AI workforce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.agentPerformance.slice(0, 5).map((agent) => (
                  <div key={agent.agentId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{agent.agentName}</h3>
                        <p className="text-sm text-gray-500">
                          {agent.totalInteractions} interactions • {agent.averageProcessingTime.toFixed(0)}ms avg
                        </p>
                      </div>
                      <Badge variant={agent.humanComparison > 1 ? 'default' : 'secondary'}>
                        {agent.humanComparison > 1 ? 'Above Human' : 'Below Human'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Accuracy</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.accuracy * 100} className="flex-1 h-2" />
                          <span className="text-xs">{(agent.accuracy * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Speed</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.speed * 100} className="flex-1 h-2" />
                          <span className="text-xs">{(agent.speed * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Reliability</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.reliability * 100} className="flex-1 h-2" />
                          <span className="text-xs">{(agent.reliability * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost Efficiency</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.costEfficiency * 100} className="flex-1 h-2" />
                          <span className="text-xs">{(agent.costEfficiency * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Human Comp.</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.humanComparison * 100} className="flex-1 h-2" />
                          <span className="text-xs">{(agent.humanComparison * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool Usage Statistics</CardTitle>
              <CardDescription>
                Most frequently used tools and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.topTools.slice(0, 10).map((tool, index) => (
                  <div key={tool.toolName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{tool.toolName}</h3>
                        <p className="text-sm text-gray-500">
                          {tool.usageCount} uses • {tool.averageProcessingTime.toFixed(0)}ms avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{tool.successRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">success rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>
                Most active users and their AI agent usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.userEngagement.slice(0, 10).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.userName}</h3>
                        <p className="text-sm text-gray-500">
                          {user.agentCount} agents • {user.conversationCount} conversations
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">last active</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
              <CardDescription>
                Current system performance and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm">{report.systemHealth.cpu.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.cpu} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm">{report.systemHealth.memory.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.memory} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm">{report.systemHealth.storage.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.storage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Network</span>
                    <span className="text-sm">{report.systemHealth.network.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.network} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-sm">{report.systemHealth.database.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.database} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AI Service</span>
                    <span className="text-sm">{report.systemHealth.aiService.toFixed(1)}%</span>
                  </div>
                  <Progress value={report.systemHealth.aiService} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}