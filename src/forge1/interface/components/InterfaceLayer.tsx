"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Monitor, 
  Activity, 
  Settings, 
  Play, 
  Pause,
  Globe,
  Zap,
  Shield,
  Database
} from "lucide-react";

interface InterfaceConfig {
  port: number;
  cors_enabled: boolean;
  rate_limit: number;
}

interface InterfaceMetrics {
  request_count: number;
  avg_response_time: number;
  error_rate: number;
}

interface InterfaceHealth {
  status: string;
  uptime: string;
  last_check: string;
  metrics: InterfaceMetrics;
}

export default function InterfaceLayer() {
  const [config, setConfig] = useState<InterfaceConfig>({
    port: 8000,
    cors_enabled: true,
    rate_limit: 1000
  });
  
  const [health, setHealth] = useState<InterfaceHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchInterfaceHealth();
  }, []);

  const fetchInterfaceHealth = async () => {
    try {
      const response = await fetch('/api/forge1/interface?endpoint=health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching interface health:', error);
    }
  };

  const handleConfigUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          layerId: 'interface',
          config: config
        })
      });
      
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/interface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_query',
          data: { query: testQuery }
        })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error executing test query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500 bg-opacity-10">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Interface/API Layer</span>
                  <Badge variant="outline">FastAPI + Web UI</Badge>
                </CardTitle>
                <CardDescription>
                  Human interface + API calls
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={health?.status === 'active' ? 'default' : 'secondary'}>
                {health?.status || 'Unknown'}
              </Badge>
              <Button
                onClick={fetchInterfaceHealth}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {health?.metrics?.request_count || 0}
              </div>
              <div className="text-sm text-slate-600">Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {health?.metrics?.avg_response_time || 0}ms
              </div>
              <div className="text-sm text-slate-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {((health?.metrics?.error_rate || 0) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-600">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Interface Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure the Interface/API layer settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Limit (req/hour)</label>
                  <Input
                    type="number"
                    value={config.rate_limit}
                    onChange={(e) => setConfig({...config, rate_limit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cors"
                  checked={config.cors_enabled}
                  onChange={(e) => setConfig({...config, cors_enabled: e.target.checked})}
                />
                <label htmlFor="cors" className="text-sm font-medium">
                  Enable CORS
                </label>
              </div>
              <Button
                onClick={handleConfigUpdate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Available API Endpoints</span>
              </CardTitle>
              <CardDescription>
                List of available API endpoints for the Interface layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/forge1/interface</div>
                    <div className="text-sm text-slate-600">Get interface layer information</div>
                  </div>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/forge1/interface?endpoint=health</div>
                    <div className="text-sm text-slate-600">Get interface health status</div>
                  </div>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">POST /api/forge1/interface</div>
                    <div className="text-sm text-slate-600">Execute interface actions</div>
                  </div>
                  <Badge variant="outline">POST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>API Testing</span>
              </CardTitle>
              <CardDescription>
                Test the Interface API with sample queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Query</label>
                <Textarea
                  placeholder="Enter your test query here..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleTestQuery}
                disabled={isLoading || !testQuery.trim()}
                className="w-full"
              >
                {isLoading ? 'Executing...' : 'Execute Query'}
              </Button>
              
              {testResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Test Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>System Monitoring</span>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of the Interface layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Request Rate</span>
                      <span className="font-medium">Normal</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>API Request</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Configuration Update</span>
                      <span className="text-slate-500">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Check</span>
                      <span className="text-slate-500">1 hour ago</span>
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