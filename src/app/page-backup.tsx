"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateAIEmployee from "@/components/CreateAIEmployee";
import ManageAIEmployees from "@/components/ManageAIEmployees";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import ModelDiagnosticsDashboard from "@/components/diagnostics/ModelDiagnosticsDashboard";

// Layer Card Component
const LayerCard = ({ layer, onAction }: { 
  layer: any; 
  onAction: (layerId: string, action: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = layer.icon;
  
  return (
    <Card key={layer.id} className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${layer.color} bg-opacity-10`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{layer.name}</span>
                <Badge variant="outline">{layer.tech}</Badge>
              </CardTitle>
              <CardDescription>{layer.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium">{layer.progress}%</div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
            <Badge 
              variant={layer.status === "active" ? "default" : "secondary"}
            >
              {layer.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▲' : '▼'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={layer.progress} className="h-2 mb-4" />
        
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">CPU:</span>
                <span className="ml-2 font-medium">{layer.config?.resources?.cpu || 'N/A'} cores</span>
              </div>
              <div>
                <span className="text-slate-500">Memory:</span>
                <span className="ml-2 font-medium">{layer.config?.resources?.memory || 'N/A'}GB</span>
              </div>
              <div>
                <span className="text-slate-500">Storage:</span>
                <span className="ml-2 font-medium">{layer.config?.resources?.storage || 'N/A'}GB</span>
              </div>
              <div>
                <span className="text-slate-500">GPU:</span>
                <span className="ml-2 font-medium">{layer.config?.resources?.gpu ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            {layer.config?.dependencies && layer.config.dependencies.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Dependencies</h5>
                <div className="flex flex-wrap gap-2">
                  {layer.config.dependencies.map((dep: string) => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAction(layer.id, 'configure')}
                  disabled={layer.status !== 'active'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAction(layer.id, 'restart')}
                  disabled={layer.status !== 'active'}
                >
                  ↻ Restart
                </Button>
                {layer.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAction(layer.id, 'stop')}
                  >
                    ⏸ Stop
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => onAction(layer.id, 'start')}
                  >
                    ▶ Start
                  </Button>
                )}
              </div>
              <Button 
                size="sm"
                onClick={() => onAction(layer.id, 'details')}
              >
                <Activity className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
    tech: "AutoGen",
    description: "Main reasoning engine + agent orchestration",
    status: "active",
    progress: 75,
    color: "bg-orange-500"
  },
  {
    id: "actions",
    name: "Actions/Tools",
    icon: Zap,
    tech: "LangChain tools + custom tools",
    description: "Execution of API calls, file I/O, code, etc",
    status: "active",
    progress: 70,
    color: "bg-yellow-500"
  },
  {
    id: "rag",
    name: "RAG",
    icon: Network,
    tech: "LangChain + LlamaIndex + Haystack",
    description: "Advanced Retrieval-Augmented Generation",
    status: "active",
    progress: 65,
    color: "bg-green-500"
  },
  {
    id: "memory",
    name: "Memory",
    icon: Database,
    tech: "Redis + PostgreSQL hybrid",
    description: "Fast + long-term memory for agents",
    status: "active",
    progress: 80,
    color: "bg-purple-500"
  },
  {
    id: "async",
    name: "Async Execution",
    icon: Activity,
    tech: "Celery + FastAPI + Function Calling",
    description: "Async background + parallel workflows",
    status: "active",
    progress: 60,
    color: "bg-red-500"
  },
  {
    id: "multimodal",
    name: "Multimodal",
    icon: Image,
    tech: "GPT-4o multimodal OR plug-ins",
    description: "Image, vision, audio input/output",
    status: "active",
    progress: 55,
    color: "bg-pink-500"
  },
  {
    id: "dev",
    name: "Dev Autonomy",
    icon: Code,
    tech: "GPT Engineer + Open Interpreter",
    description: "Build tools FOR YOU, not for Forge",
    status: "active",
    progress: 50,
    color: "bg-indigo-500"
  },
  {
    id: "visual",
    name: "Visual UI",
    icon: Monitor,
    tech: "SuperAGI dashboard",
    description: "Inspect agent runs if you want GUI",
    status: "inactive",
    progress: 30,
    color: "bg-gray-500"
  },
  {
    id: "security",
    name: "Security & CI/CD",
    icon: Shield,
    tech: "Docker + GitHub Actions + auth + pre-commit",
    description: "Real dev pipeline",
    status: "active",
    progress: 75,
    color: "bg-teal-500"
  }
];

export default function Home() {
  const { toast } = useToast();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<"running" | "paused">("running");
  const [deploymentStatus, setDeploymentStatus] = useState({
    environment: 'Development',
    healthy: true,
    uptime: '24/7',
    version: '1.0.0',
    health: '98%',
    deploying: false,
    lastDeployment: new Date(),
    lastDeploymentStatus: 'Success'
  });

  const toggleSystemStatus = () => {
    setSystemStatus(systemStatus === "running" ? "paused" : "running");
  };

  const handleLayerAction = async (layerId: string, action: string) => {
    try {
      console.log(`Layer action: ${action} for layer ${layerId}`);
      
      // Simulate API call for layer actions
      const response = await fetch('/api/forge1/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `${action}_layer`,
          layerId: layerId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success message or update UI
        toast({
          title: "Success!",
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} action completed successfully for ${layerId}`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} ${layerId}: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error handling layer action:', error);
      toast({
        title: "Error",
        description: `Error: ${action} failed for ${layerId}`,
        variant: "destructive",
      });
    }
  };

  const handleDeploymentAction = async (action: string) => {
    try {
      console.log(`Deployment action: ${action}`);
      
      // Update UI state for deploying action
      if (action === 'deploy') {
        setDeploymentStatus(prev => ({ ...prev, deploying: true }));
      }

      // Simulate API call for deployment actions
      const response = await fetch('/api/forge1/deployment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update deployment status based on action
        switch (action) {
          case 'deploy':
            setDeploymentStatus(prev => ({
              ...prev,
              deploying: false,
              lastDeployment: new Date(),
              lastDeploymentStatus: 'Success',
              healthy: true,
              health: '99%'
            }));
            toast({
              title: "Success!",
              description: "Deployment completed successfully!",
            });
            break;
          case 'healthcheck':
            setDeploymentStatus(prev => ({
              ...prev,
              healthy: result.data?.healthy || true,
              health: result.data?.health || '98%'
            }));
            toast({
              title: "Success!",
              description: "Health check completed!",
            });
            break;
          case 'docker':
          case 'cloud':
          case 'onprem':
          case 'custom':
            setDeploymentStatus(prev => ({
              ...prev,
              environment: action.charAt(0).toUpperCase() + action.slice(1)
            }));
            toast({
              title: "Success!",
              description: `Deployment environment set to ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            });
            break;
          default:
            toast({
              title: "Success!",
              description: `${action.charAt(0).toUpperCase() + action.slice(1)} action completed successfully!`,
            });
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action}: ${result.error}`,
          variant: "destructive",
        });
        if (action === 'deploy') {
          setDeploymentStatus(prev => ({ ...prev, deploying: false }));
        }
      }
    } catch (error) {
      console.error('Error handling deployment action:', error);
      toast({
        title: "Error",
        description: `Error: ${action} failed`,
        variant: "destructive",
      });
      if (action === 'deploy') {
        setDeploymentStatus(prev => ({ ...prev, deploying: false }));
      }
    }
  };

  const activeLayers = systemLayers.filter(layer => layer.status === "active");
  const overallProgress = Math.round(
    activeLayers.reduce((sum, layer) => sum + layer.progress, 0) / activeLayers.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg animate-pulse"></div>
              <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Forge1
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                AI System Engineering Platform
              </p>
            </div>
          </div>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Autonomous creation of AI white-collar employees that outperform humans, 
            designed for business integration and scalability.
          </p>
        </div>

        {/* System Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>
                  Overall system health and performance metrics
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={systemStatus === "running" ? "default" : "secondary"}>
                  {systemStatus === "running" ? "Running" : "Paused"}
                </Badge>
                <Button
                  onClick={toggleSystemStatus}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {systemStatus === "running" ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{systemStatus === "running" ? "Pause" : "Start"}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activeLayers.length}</div>
                <div className="text-slate-600 dark:text-slate-400">Active Layers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-slate-600 dark:text-slate-400">Total Layers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-slate-600 dark:text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <div className="text-slate-600 dark:text-slate-400">Scalability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Layers */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create-employee">Create AI Employee</TabsTrigger>
            <TabsTrigger value="manage-employees">Manage Employees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="diagnostics">Model Diagnostics</TabsTrigger>
            <TabsTrigger value="layers">System Layers</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemLayers.map((layer) => {
                const IconComponent = layer.icon;
                return (
                  <Card 
                    key={layer.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedLayer === layer.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedLayer(layer.id === selectedLayer ? null : layer.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${layer.color} bg-opacity-10`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{layer.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {layer.tech}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={layer.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {layer.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {layer.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span className="font-medium">{layer.progress}%</span>
                        </div>
                        <Progress value={layer.progress} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="create-employee" className="space-y-6">
            <CreateAIEmployee />
          </TabsContent>

          <TabsContent value="manage-employees" className="space-y-6">
            <ManageAIEmployees />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6">
            <ModelDiagnosticsDashboard />
          </TabsContent>

          <TabsContent value="layers" className="space-y-6">
            <div className="grid gap-6">
              {systemLayers.map((layer) => (
                <LayerCard 
                  key={layer.id}
                  layer={layer}
                  onAction={handleLayerAction}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Deploy</CardTitle>
                  <CardDescription>
                    Deploy Forge1 to your preferred environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => handleDeploymentAction('docker')}
                    >
                      <div className="w-8 h-8 mb-2">🐳</div>
                      <span className="text-sm">Docker</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => handleDeploymentAction('cloud')}
                    >
                      <div className="w-8 h-8 mb-2">☁️</div>
                      <span className="text-sm">Cloud</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => handleDeploymentAction('onprem')}
                    >
                      <div className="w-8 h-8 mb-2">🏠</div>
                      <span className="text-sm">On-Prem</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => handleDeploymentAction('custom')}
                    >
                      <div className="w-8 h-8 mb-2">🔧</div>
                      <span className="text-sm">Custom</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                  <CardDescription>
                    Current deployment status and health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Environment</span>
                      <Badge variant="outline">{deploymentStatus.environment || 'Development'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <Badge 
                        variant={deploymentStatus.healthy ? "default" : "destructive"}
                      >
                        {deploymentStatus.healthy ? 'Healthy' : 'Issues Detected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">{deploymentStatus.uptime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Version</span>
                      <span className="text-sm font-medium">{deploymentStatus.version || '1.0.0'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span className="font-medium">{deploymentStatus.health || '98%'}</span>
                    </div>
                    <Progress value={parseInt(deploymentStatus.health || '98')} className="h-2" />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleDeploymentAction('healthcheck')}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Health Check
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeploymentAction('logs')}
                    >
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
                <CardDescription>
                  Minimum specifications for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>CPU</span>
                      <span className="font-medium">8+ cores</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>RAM</span>
                      <span className="font-medium">32GB+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span className="font-medium">500GB SSD</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Network</span>
                      <span className="font-medium">1Gbps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GPU</span>
                      <span className="font-medium">Recommended</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>OS</span>
                      <span className="font-medium">Linux/Ubuntu</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Actions</CardTitle>
                <CardDescription>
                  Manage your Forge1 deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    size="sm"
                    onClick={() => handleDeploymentAction('deploy')}
                    disabled={deploymentStatus.deploying}
                  >
                    {deploymentStatus.deploying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Deploying...
                      </>
                    ) : (
                      'Deploy'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeploymentAction('rollback')}
                  >
                    Rollback
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeploymentAction('scale')}
                  >
                    Scale
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeploymentAction('backup')}
                  >
                    Backup
                  </Button>
                </div>
                
                {deploymentStatus.lastDeployment && (
                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Last Deployment</h5>
                    <div className="text-sm text-slate-600">
                      <div>Time: {new Date(deploymentStatus.lastDeployment).toLocaleString()}</div>
                      <div>Status: {deploymentStatus.lastDeploymentStatus || 'Success'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}