"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Cube, 
  VrCardboard, 
  Smartphone, 
  Users, 
  MapPin, 
  Play, 
  Pause,
  RotateCcw,
  Zap,
  Target,
  Navigation,
  Layers,
  Plus,
  Activity,
  Eye,
  HandMetal,
  MessageSquare,
  TrendingUp,
  Settings,
  Maximize
} from "lucide-react";
import { SpatialAgentsService, SpatialAgent, SpatialEnvironment, XRSession } from "../service";

const spatialAgentsService = new SpatialAgentsService();

export default function SpatialAgentsDashboard() {
  const [agents, setAgents] = useState<SpatialAgent[]>([]);
  const [environments, setEnvironments] = useState<SpatialEnvironment[]>([]);
  const [sessions, setSessions] = useState<XRSession[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SpatialAgent | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<SpatialEnvironment | null>(null);
  const [selectedSession, setSelectedSession] = useState<XRSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Form states
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState<SpatialAgent['type']>('vr_guide');
  const [environmentType, setEnvironmentType] = useState<SpatialAgent['environment']>('vr');
  const [environmentName, setEnvironmentName] = useState("");

  useEffect(() => {
    loadAgents();
    loadEnvironments();
    loadSessions();
  }, []);

  const loadAgents = async () => {
    // In production, load from API
    const mockAgents: SpatialAgent[] = [
      {
        id: "spatial_1",
        name: "VR Navigation Guide",
        type: "vr_guide",
        environment: "vr",
        status: "active",
        capabilities: [],
        knowledge_base: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setAgents(mockAgents);
  };

  const loadEnvironments = async () => {
    // In production, load from API
    const mockEnvironments: SpatialEnvironment[] = [
      {
        id: "env_1",
        name: "Training Room VR",
        type: "vr_room",
        dimensions: { width: 10, height: 3, depth: 10 },
        objects: [],
        agents: [],
        active_users: 2,
        created_at: new Date()
      }
    ];
    setEnvironments(mockEnvironments);
  };

  const loadSessions = async () => {
    // In production, load from API
    const mockSessions: XRSession[] = [
      {
        id: "session_1",
        environment_id: "env_1",
        agent_id: "spatial_1",
        session_type: "training",
        status: "active",
        start_time: new Date(),
        interactions: [],
        performance_data: {
          task_completion_rate: 0.75,
          interaction_accuracy: 0.85,
          response_time_avg: 120,
          user_engagement: 0.9,
          error_count: 2
        },
        feedback: {
          overall_rating: 4,
          ease_of_use: 4,
          effectiveness: 4,
          comments: "Great training experience",
          suggestions: []
        }
      }
    ];
    setSessions(mockSessions);
  };

  const handleCreateAgent = async () => {
    if (!agentName) return;

    setIsCreating(true);
    try {
      const newAgent = await spatialAgentsService.createSpatialAgent({
        name: agentName,
        type: agentType,
        environment: environmentType,
        capabilities: [
          {
            name: "Spatial Navigation",
            description: "Guide users through 3D environments",
            type: "navigation",
            parameters: {}
          }
        ]
      });

      setAgents(prev => [...prev, newAgent]);
      setAgentName("");
    } catch (error) {
      console.error('Failed to create spatial agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!environmentName) return;

    try {
      const newEnvironment = await spatialAgentsService.createSpatialEnvironment({
        name: environmentName,
        type: environmentType === 'vr' ? 'vr_room' : 'ar_space',
        dimensions: { width: 10, height: 3, depth: 10 },
        objects: []
      });

      setEnvironments(prev => [...prev, newEnvironment]);
      setEnvironmentName("");
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedAgent || !selectedEnvironment) return;

    setIsStartingSession(true);
    try {
      const newSession = await spatialAgentsService.startXRSession({
        environment_id: selectedEnvironment.id,
        agent_id: selectedAgent.id,
        session_type: 'training'
      });

      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'vr_guide':
        return <VrCardboard className="w-4 h-4" />;
      case 'ar_assistant':
        return <Smartphone className="w-4 h-4" />;
      case 'metaverse_host':
        return <Users className="w-4 h-4" />;
      case 'spatial_analyst':
        return <Target className="w-4 h-4" />;
      case 'xr_trainer':
        return <Settings className="w-4 h-4" />;
      default:
        return <Cube className="w-4 h-4" />;
    }
  };

  const getEnvironmentTypeIcon = (type: string) => {
    switch (type) {
      case 'vr_room':
        return <VrCardboard className="w-4 h-4" />;
      case 'ar_space':
        return <Smartphone className="w-4 h-4" />;
      case 'metaverse_world':
        return <Users className="w-4 h-4" />;
      case 'mixed_reality_scene':
        return <Layers className="w-4 h-4" />;
      default:
        return <Cube className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Pause className="w-4 h-4 text-gray-500" />;
      case 'training':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <RotateCcw className="w-4 h-4 text-red-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spatial Agents / XR</h2>
          <p className="text-muted-foreground">
            VR/metaverse interfaces with spatial AI agents
          </p>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Spatial Agents</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="sessions">XR Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Spatial Agent</span>
                </CardTitle>
                <CardDescription>
                  Create AI agent for XR environments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agentType">Agent Type</Label>
                  <Select value={agentType} onValueChange={(value: any) => setAgentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vr_guide">
                        <div className="flex items-center space-x-2">
                          <VrCardboard className="w-4 h-4" />
                          <span>VR Guide</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ar_assistant">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>AR Assistant</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="metaverse_host">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Metaverse Host</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="spatial_analyst">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Spatial Analyst</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="xr_trainer">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>XR Trainer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="environmentType">Environment</Label>
                  <Select value={environmentType} onValueChange={(value: any) => setEnvironmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vr">Virtual Reality</SelectItem>
                      <SelectItem value="ar">Augmented Reality</SelectItem>
                      <SelectItem value="metaverse">Metaverse</SelectItem>
                      <SelectItem value="mixed_reality">Mixed Reality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateAgent} 
                  disabled={isCreating || !agentName}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Agent"}
                </Button>
              </CardContent>
            </Card>

            {/* Agents List */}
            <Card>
              <CardHeader>
                <CardTitle>Spatial Agents</CardTitle>
                <CardDescription>
                  Active AI agents in XR environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getAgentTypeIcon(agent.type)}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent.status)}
                          <Badge variant="outline">{agent.environment.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {agent.type.replace('_', ' ')} • {agent.capabilities.length} capabilities
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agent.knowledge_base.length} knowledge items
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Environment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Environment</span>
                </CardTitle>
                <CardDescription>
                  Create 3D environment for XR experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="environmentName">Environment Name</Label>
                  <Input
                    id="environmentName"
                    value={environmentName}
                    onChange={(e) => setEnvironmentName(e.target.value)}
                    placeholder="Enter environment name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="environmentType">Environment Type</Label>
                  <Select value={environmentType} onValueChange={(value: any) => setEnvironmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vr">VR Room</SelectItem>
                      <SelectItem value="ar">AR Space</SelectItem>
                      <SelectItem value="metaverse">Metaverse World</SelectItem>
                      <SelectItem value="mixed_reality">Mixed Reality Scene</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateEnvironment} 
                  disabled={!environmentName}
                  className="w-full"
                >
                  Create Environment
                </Button>
              </CardContent>
            </Card>

            {/* Environments List */}
            <Card>
              <CardHeader>
                <CardTitle>3D Environments</CardTitle>
                <CardDescription>
                  Available XR environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {environments.map((environment) => (
                    <div
                      key={environment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEnvironment?.id === environment.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedEnvironment(environment)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEnvironmentTypeIcon(environment.type)}
                          <span className="font-medium">{environment.name}</span>
                        </div>
                        <Badge variant="outline">
                          {environment.active_users} users
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {environment.type.replace('_', ' ')} • {environment.objects.length} objects
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {environment.dimensions.width}x{environment.dimensions.height}x{environment.dimensions.depth}m
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Start XR Session</span>
                </CardTitle>
                <CardDescription>
                  Begin new XR experience session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Agent</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedAgent ? (
                      <div>
                        <div className="font-medium">{selectedAgent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedAgent.type.replace('_', ' ')} • {selectedAgent.status}
                        </div>
                      </div>
                    ) : (
                      "No agent selected"
                    )}
                  </div>
                </div>

                <div>
                  <Label>Selected Environment</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedEnvironment ? (
                      <div>
                        <div className="font-medium">{selectedEnvironment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedEnvironment.type.replace('_', ' ')} • {selectedEnvironment.active_users} users
                        </div>
                      </div>
                    ) : (
                      "No environment selected"
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleStartSession} 
                  disabled={isStartingSession || !selectedAgent || !selectedEnvironment}
                  className="w-full"
                >
                  {isStartingSession ? "Starting..." : "Start Session"}
                </Button>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <Card>
              <CardHeader>
                <CardTitle>XR Sessions</CardTitle>
                <CardDescription>
                  Active and completed XR sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session.status)}
                          <span className="font-medium capitalize">{session.session_type}</span>
                        </div>
                        <Badge variant="outline">
                          {session.interactions.length} interactions
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started: {session.start_time.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Completion: {Math.round(session.performance_data.task_completion_rate * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Session Performance</span>
                </CardTitle>
                <CardDescription>
                  XR session performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(selectedSession.performance_data.task_completion_rate * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(selectedSession.performance_data.interaction_accuracy * 100)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Response Time</span>
                        <span className="font-medium">{selectedSession.performance_data.response_time_avg}ms</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (selectedSession.performance_data.response_time_avg / 5))} 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>User Engagement</span>
                        <span className="font-medium">{Math.round(selectedSession.performance_data.user_engagement * 100)}%</span>
                      </div>
                      <Progress 
                        value={selectedSession.performance_data.user_engagement * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {selectedSession.performance_data.error_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Errors</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {selectedSession.interactions.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Interactions</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {selectedSession.feedback.overall_rating}/5
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a session to view performance metrics
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environment Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Environment Analytics</span>
                </CardTitle>
                <CardDescription>
                  3D environment usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {environments.reduce((sum, env) => sum + env.active_users, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {sessions.filter(s => s.status === 'active').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Sessions</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Environment Types</div>
                    <div className="space-y-2">
                      {['vr_room', 'ar_space', 'metaverse_world', 'mixed_reality_scene'].map(type => {
                        const count = environments.filter(env => env.type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {getEnvironmentTypeIcon(type)}
                              <span className="capitalize">{type.replace('_', ' ')}</span>
                            </div>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Agent Distribution</div>
                    <div className="space-y-2">
                      {['vr_guide', 'ar_assistant', 'metaverse_host', 'spatial_analyst', 'xr_trainer'].map(type => {
                        const count = agents.filter(agent => agent.type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {getAgentTypeIcon(type)}
                              <span className="capitalize">{type.replace('_', ' ')}</span>
                            </div>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}