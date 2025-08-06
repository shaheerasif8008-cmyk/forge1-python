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
  Database, 
  Activity, 
  Settings, 
  Save,
  Search,
  Trash2,
  HardDrive,
  Cloud,
  Zap,
  BarChart3,
  Clock,
  RefreshCw
} from "lucide-react";

interface MemoryStore {
  id: string;
  name: string;
  type: string;
  size: string;
  entries: number;
  hit_rate: number;
  ttl: number;
  status: string;
}

interface MemoryMetrics {
  total_operations: number;
  read_operations: number;
  write_operations: number;
  avg_read_time: number;
  avg_write_time: number;
  cache_efficiency: number;
  memory_fragmentation: number;
  backup_status: string;
  last_backup: string;
}

export default function MemoryLayer() {
  const [stores, setStores] = useState<MemoryStore[]>([]);
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memoryKey, setMemoryKey] = useState('');
  const [memoryValue, setMemoryValue] = useState('');
  const [memoryType, setMemoryType] = useState('short_term');
  const [storeResult, setStoreResult] = useState<any>(null);
  const [retrieveKey, setRetrieveKey] = useState('');
  const [retrieveResult, setRetrieveResult] = useState<any>(null);

  useEffect(() => {
    fetchStores();
    fetchMetrics();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/forge1/memory?action=stores');
      const data = await response.json();
      setStores(data.stores);
    } catch (error) {
      console.error('Error fetching memory stores:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/forge1/memory?action=metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching memory metrics:', error);
    }
  };

  const handleStoreMemory = async () => {
    if (!memoryKey.trim() || !memoryValue.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store_memory',
          data: {
            key: memoryKey,
            value: memoryValue,
            type: memoryType,
            ttl: memoryType === 'short_term' ? 3600 : -1
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setStoreResult(result.result);
        setMemoryKey('');
        setMemoryValue('');
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error storing memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveMemory = async () => {
    if (!retrieveKey.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retrieve_memory',
          data: { key: retrieveKey }
        })
      });
      
      const result = await response.json();
      setRetrieveResult(result);
    } catch (error) {
      console.error('Error retrieving memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_cache' })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchStores();
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup_memory' })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error backing up memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoreIcon = (type: string) => {
    switch (type) {
      case 'short_term': return <Zap className="w-4 h-4" />;
      case 'long_term': return <HardDrive className="w-4 h-4" />;
      case 'context': return <Cloud className="w-4 h-4" />;
      case 'vector': return <Database className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500 bg-opacity-10">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Memory Layer</span>
                  <Badge variant="outline">Redis + PostgreSQL hybrid</Badge>
                </CardTitle>
                <CardDescription>
                  Fast + long-term memory for agents
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchStores();
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
              <div className="text-2xl font-bold text-purple-600">
                {metrics?.total_operations?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-600">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(metrics?.cache_efficiency * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Cache Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.avg_read_time || 0}ms
              </div>
              <div className="text-sm text-slate-600">Avg Read Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics?.backup_status === 'completed' ? '✓' : '⏳'}
              </div>
              <div className="text-sm text-slate-600">Backup Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stores" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stores">Memory Stores</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Memory Stores</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage memory storage systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {stores.map((store) => (
                  <Card key={store.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100">
                            {getStoreIcon(store.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{store.name}</h4>
                              <Badge variant="outline">{store.type}</Badge>
                              <Badge 
                                variant={store.status === 'active' ? 'default' : 'secondary'}
                              >
                                {store.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>{store.entries.toLocaleString()} entries</span>
                              <span>{store.size}</span>
                              <span>Hit rate: {(store.hit_rate * 100).toFixed(1)}%</span>
                              <span>TTL: {store.ttl === -1 ? '∞' : `${store.ttl}s`}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Hit Rate</span>
                              <span>{(store.hit_rate * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={store.hit_rate * 100} className="h-1" />
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

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Store Memory</span>
                </CardTitle>
                <CardDescription>
                  Store data in memory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key</label>
                  <Input
                    placeholder="Enter memory key..."
                    value={memoryKey}
                    onChange={(e) => setMemoryKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Textarea
                    placeholder="Enter memory value..."
                    value={memoryValue}
                    onChange={(e) => setMemoryValue(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Memory Type</label>
                  <Select value={memoryType} onValueChange={setMemoryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short Term (Redis)</SelectItem>
                      <SelectItem value="long_term">Long Term (PostgreSQL)</SelectItem>
                      <SelectItem value="context">Context Buffer</SelectItem>
                      <SelectItem value="vector">Vector Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStoreMemory}
                  disabled={isLoading || !memoryKey.trim() || !memoryValue.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Storing...' : 'Store Memory'}
                </Button>
                
                {storeResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Store Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-slate-600">Memory ID: </span><span className="font-medium">{storeResult.memory_id}</span></div>
                        <div><span className="text-slate-600">Key: </span><span className="font-medium">{storeResult.key}</span></div>
                        <div><span className="text-slate-600">Type: </span><span className="font-medium">{storeResult.type}</span></div>
                        <div><span className="text-slate-600">Size: </span><span className="font-medium">{storeResult.size} bytes</span></div>
                        <div><span className="text-slate-600">Location: </span><span className="font-medium">{storeResult.location}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Retrieve Memory</span>
                </CardTitle>
                <CardDescription>
                  Retrieve data from memory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key</label>
                  <Input
                    placeholder="Enter memory key to retrieve..."
                    value={retrieveKey}
                    onChange={(e) => setRetrieveKey(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleRetrieveMemory}
                  disabled={isLoading || !retrieveKey.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Retrieving...' : 'Retrieve Memory'}
                </Button>
                
                {retrieveResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Retrieve Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-slate-600">Key: </span><span className="font-medium">{retrieveResult.key}</span></div>
                        <div><span className="text-slate-600">Found: </span><span className={`font-medium ${retrieveResult.found ? 'text-green-600' : 'text-red-600'}`}>{retrieveResult.found ? 'Yes' : 'No'}</span></div>
                        <div><span className="text-slate-600">Retrieved From: </span><span className="font-medium">{retrieveResult.retrieved_from}</span></div>
                        <div><span className="text-slate-600">Retrieval Time: </span><span className="font-medium">{retrieveResult.retrieval_time}ms</span></div>
                        {retrieveResult.found && (
                          <div>
                            <span className="text-slate-600">Value: </span>
                            <p className="font-medium mt-1">{retrieveResult.value}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Memory Management</span>
              </CardTitle>
              <CardDescription>
                Manage and optimize memory systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleClearCache}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Trash2 className="w-6 h-6 mb-2" />
                  <span>Clear Cache</span>
                </Button>
                <Button
                  onClick={handleBackup}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Save className="w-6 h-6 mb-2" />
                  <span>Backup Now</span>
                </Button>
                <Button
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span>Optimize</span>
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Memory Usage Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Redis Usage</span>
                      <span className="font-medium">3.2GB / 8GB</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>PostgreSQL Usage</span>
                      <span className="font-medium">45GB / 100GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Memory Analytics</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Read/Write Ratio</span>
                      <span className="font-medium">
                        {metrics ? Math.round((metrics.read_operations / (metrics.read_operations + metrics.write_operations)) * 100) : 0}% Read
                      </span>
                    </div>
                    <Progress 
                      value={metrics ? (metrics.read_operations / (metrics.read_operations + metrics.write_operations)) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Fragmentation</span>
                      <span className="font-medium">
                        {(metrics?.memory_fragmentation * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.memory_fragmentation * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Operations: </span>
                      <span className="font-medium">{metrics?.total_operations?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Read Operations: </span>
                      <span className="font-medium">{metrics?.read_operations?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Write Operations: </span>
                      <span className="font-medium">{metrics?.write_operations?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Write Time: </span>
                      <span className="font-medium">{metrics?.avg_write_time || 0}ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Operations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Memory stored</span>
                      <span className="text-slate-500">1 minute ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory retrieved</span>
                      <span className="text-slate-500">3 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache cleared</span>
                      <span className="text-slate-500">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup completed</span>
                      <span className="text-slate-500">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="w-5 h-5" />
                <span>Backup & Recovery</span>
              </CardTitle>
              <CardDescription>
                Manage memory backups and recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Last Backup</span>
                      <span className="font-medium">
                        {metrics?.last_backup ? new Date(metrics.last_backup).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Backup Status</span>
                      <Badge variant={metrics?.backup_status === 'completed' ? 'default' : 'secondary'}>
                        {metrics?.backup_status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleBackup}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Backing Up...' : 'Create Backup'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Schedule</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retention Period</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Recent Backups</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Backup-2024-01-15</span>
                    <span className="text-slate-500">2.1GB • 1 hour ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup-2024-01-14</span>
                    <span className="text-slate-500">2.0GB • 1 day ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup-2024-01-13</span>
                    <span className="text-slate-500">1.9GB • 2 days ago</span>
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