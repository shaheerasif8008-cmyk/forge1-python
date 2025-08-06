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
  Monitor, 
  Activity, 
  Settings, 
  LayoutDashboard,
  Widget,
  Users,
  BarChart3,
  Download,
  Plus,
  Eye,
  Grid3X3,
  GitBranch,
  TrendingUp,
  Clock
} from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: string[];
  layout: string;
  refresh_interval: number;
  is_public: boolean;
  last_accessed: string;
}

interface Widget {
  id: string;
  name: string;
  type: string;
  data_source: string;
  refresh_rate: number;
  config: Record<string, any>;
}

interface Session {
  id: string;
  user_id: string;
  dashboard_id: string;
  start_time: string;
  last_activity: string;
  duration: number;
  interactions: number;
  status: string;
}

export default function VisualUILayer() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    layout: 'grid',
    refresh_interval: 5000,
    is_public: false
  });
  const [newWidget, setNewWidget] = useState({
    name: '',
    type: '',
    data_source: '',
    refresh_rate: 5000
  });

  useEffect(() => {
    fetchDashboards();
    fetchWidgets();
    fetchSessions();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/forge1/visual?action=dashboards');
      const data = await response.json();
      setDashboards(data.dashboards);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  const fetchWidgets = async () => {
    try {
      const response = await fetch('/api/forge1/visual?action=widgets');
      const data = await response.json();
      setWidgets(data.widgets);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/forge1/visual?action=sessions');
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashboard.name.trim() || !newDashboard.description.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_dashboard',
          data: newDashboard
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewDashboard({ name: '', description: '', layout: 'grid', refresh_interval: 5000, is_public: false });
        fetchDashboards();
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWidget = async () => {
    if (!newWidget.name.trim() || !newWidget.type.trim() || !newWidget.data_source.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_widget',
          data: newWidget
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewWidget({ name: '', type: '', data_source: '', refresh_rate: 5000 });
        fetchWidgets();
      }
    } catch (error) {
      console.error('Error creating widget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'gauge': return <BarChart3 className="w-4 h-4" />;
      case 'table': return <Grid3X3 className="w-4 h-4" />;
      case 'graph': return <GitBranch className="w-4 h-4" />;
      case 'line_chart': return <TrendingUp className="w-4 h-4" />;
      case 'bar_chart': return <BarChart3 className="w-4 h-4" />;
      case 'list': return <LayoutDashboard className="w-4 h-4" />;
      default: return <Widget className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-gray-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-500 bg-opacity-10">
                <Monitor className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Visual UI Layer</span>
                  <Badge variant="outline">SuperAGI dashboard</Badge>
                </CardTitle>
                <CardDescription>
                  Inspect agent runs if you want GUI
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Inactive</Badge>
              <Button
                onClick={() => {
                  fetchDashboards();
                  fetchWidgets();
                  fetchSessions();
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
              <div className="text-2xl font-bold text-gray-600">
                {dashboards.length}
              </div>
              <div className="text-sm text-slate-600">Dashboards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {widgets.length}
              </div>
              <div className="text-sm text-slate-600">Widgets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboards.filter(d => d.is_public).length}
              </div>
              <div className="text-sm text-slate-600">Public Dashboards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LayoutDashboard className="w-5 h-5" />
                <span>Available Dashboards</span>
              </CardTitle>
              <CardDescription>
                Browse and manage SuperAGI dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {dashboards.map((dashboard) => (
                  <Card key={dashboard.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{dashboard.name}</h4>
                              <Badge variant="outline">{dashboard.layout}</Badge>
                              <Badge 
                                variant={dashboard.is_public ? 'default' : 'secondary'}
                              >
                                {dashboard.is_public ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{dashboard.description}</p>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Widgets: {dashboard.widgets.length}</span>
                              <span>Refresh: {dashboard.refresh_interval}ms</span>
                              <span>Last accessed: {new Date(dashboard.last_accessed).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Widget className="w-5 h-5" />
                <span>Available Widgets</span>
              </CardTitle>
              <CardDescription>
                Browse and manage dashboard widgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-green-100">
                            {getWidgetIcon(widget.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{widget.name}</h4>
                              <Badge variant="outline">{widget.type}</Badge>
                              <Badge variant="secondary">{widget.data_source}</Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Refresh: {widget.refresh_rate}ms</span>
                              <span>Config: {Object.keys(widget.config).length} items</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Active Sessions</span>
              </CardTitle>
              <CardDescription>
                Monitor user sessions and dashboard interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">Session {session.id}</h4>
                              <Badge variant="outline">{session.user_id}</Badge>
                              <Badge 
                                variant={session.status === 'active' ? 'default' : 'secondary'}
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Dashboard: {session.dashboard_id}</span>
                              <span>Duration: {Math.floor(session.duration / 60)}m</span>
                              <span>Interactions: {session.interactions}</span>
                              <span>Started: {new Date(session.start_time).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(session.last_activity).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-slate-500">Last activity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard Analytics</span>
              </CardTitle>
              <CardDescription>
                Usage analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Dashboard Usage</span>
                      <span className="font-medium">High</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Widget Performance</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Session Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Sessions: </span>
                      <span className="font-medium">{sessions.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Active Sessions: </span>
                      <span className="font-medium">{sessions.filter(s => s.status === 'active').length}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Duration: </span>
                      <span className="font-medium">
                        {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60)}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total Interactions: </span>
                      <span className="font-medium">
                        {sessions.reduce((sum, s) => sum + s.interactions, 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Popular Dashboards</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>System Overview</span>
                      <span className="text-slate-500">45 views today</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agent Monitoring</span>
                      <span className="text-slate-500">32 views today</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workflow Visualization</span>
                      <span className="text-slate-500">28 views today</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resource Monitoring</span>
                      <span className="text-slate-500">15 views today</span>
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