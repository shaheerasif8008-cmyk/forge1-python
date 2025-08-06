'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Activity, 
  Zap, 
  DollarSign, 
  RefreshCw, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Cpu
} from 'lucide-react';
import { modelRouter } from '@/forge1/services/model-router';
import { LLM_MODELS, MODEL_PROVIDERS } from '@/forge1/config/models';

interface ModelHealth {
  status: string;
  latency: number;
  errorRate: number;
}

export default function ModelDiagnosticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [modelHealth, setModelHealth] = useState<Record<string, ModelHealth>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const analyticsData = modelRouter.getRoutingAnalytics();
      const healthData = modelRouter.getModelHealth();
      setAnalytics(analyticsData);
      setModelHealth(healthData);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, errorRate: number) => {
    if (status === 'available' && errorRate < 5) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status === 'available' && errorRate < 20) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string, errorRate: number) => {
    if (status === 'available' && errorRate < 5) {
      return 'text-green-600';
    } else if (status === 'available' && errorRate < 20) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  const formatLatency = (latency: number) => {
    if (latency < 1000) {
      return `${Math.round(latency)}ms`;
    }
    return `${(latency / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading diagnostics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Failed to load diagnostics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Model Diagnostics Dashboard</h2>
          <p className="text-gray-600">Multi-model LLM system performance and analytics</p>
        </div>
        <Button onClick={loadDiagnostics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLatency(analytics.averageLatency)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.fallbackRate.toFixed(1)}% fallback rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(analytics.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Across all requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(modelHealth).filter(h => h.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {Object.keys(LLM_MODELS).length} total models
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Model Usage</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="tasks">Task Types</TabsTrigger>
          <TabsTrigger value="health">Model Health</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Usage Statistics</CardTitle>
              <CardDescription>
                Usage distribution across different AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.modelUsage)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([modelId, usage]) => {
                    const model = LLM_MODELS[modelId];
                    const total = analytics.totalRequests;
                    const percentage = total > 0 ? (usage / total) * 100 : 0;
                    
                    return (
                      <div key={modelId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(modelHealth[modelId]?.status || 'unknown', modelHealth[modelId]?.errorRate || 0)}
                            <div>
                              <h3 className="font-medium">{model?.name || modelId}</h3>
                              <p className="text-sm text-gray-500">
                                {MODEL_PROVIDERS[model?.provider]?.name || model?.provider}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{usage} requests</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Usage</CardTitle>
              <CardDescription>
                Request distribution across LLM providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.providerUsage)
                  .sort(([,a], [,b]) => b - a)
                  .map(([providerId, usage]) => {
                    const provider = MODEL_PROVIDERS[providerId];
                    const total = analytics.totalRequests;
                    const percentage = total > 0 ? (usage / total) * 100 : 0;
                    
                    return (
                      <div key={providerId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Cpu className="w-5 h-5 text-blue-500" />
                            <div>
                              <h3 className="font-medium">{provider?.name || providerId}</h3>
                              <p className="text-sm text-gray-500">
                                {provider?.models.length || 0} models available
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{usage} requests</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Type Distribution</CardTitle>
              <CardDescription>
                Types of tasks being processed by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.taskTypeUsage)
                  .sort(([,a], [,b]) => b - a)
                  .map(([taskType, usage]) => {
                    const total = analytics.totalRequests;
                    const percentage = total > 0 ? (usage / total) * 100 : 0;
                    
                    return (
                      <div key={taskType} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Zap className="w-5 h-5 text-green-500" />
                            <div>
                              <h3 className="font-medium capitalize">{taskType.replace('-', ' ')}</h3>
                              <p className="text-sm text-gray-500">
                                Automated task processing
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{usage} requests</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Health Status</CardTitle>
              <CardDescription>
                Current health and performance metrics for each model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(modelHealth)
                  .map(([modelId, health]) => {
                    const model = LLM_MODELS[modelId];
                    
                    return (
                      <div key={modelId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(health.status, health.errorRate)}
                            <div>
                              <h3 className="font-medium">{model?.name || modelId}</h3>
                              <p className="text-sm text-gray-500">
                                {MODEL_PROVIDERS[model?.provider]?.name || model?.provider}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={health.status === 'available' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {health.status}
                            </Badge>
                            <span className={`text-sm ${getStatusColor(health.status, health.errorRate)}`}>
                              {health.errorRate.toFixed(1)}% error rate
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Latency:</span>
                            <span className="ml-2 font-medium">{formatLatency(health.latency)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Quality:</span>
                            <span className="ml-2 font-medium capitalize">{model?.quality || 'unknown'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Speed:</span>
                            <span className="ml-2 font-medium capitalize">{model?.speed || 'unknown'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Max Tokens:</span>
                            <span className="ml-2 font-medium">{model?.maxTokens?.toLocaleString() || 'unknown'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Routing Logs</CardTitle>
              <CardDescription>
                Most recent model routing decisions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.recentLogs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {log.request.taskType}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {log.response.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {formatLatency(log.response.latency)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">Model:</span>
                        <span>{LLM_MODELS[log.response.modelId]?.name || log.response.modelId}</span>
                        {log.response.fallbackUsed && (
                          <Badge variant="secondary" className="text-xs">Fallback Used</Badge>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {log.routingDecision.reasoning}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}