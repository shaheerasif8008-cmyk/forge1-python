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
  Brain, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  MessageSquare, 
  BarChart3,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Users,
  TrendingUp,
  Activity,
  Plus,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAgent {
  id: string;
  name: string;
  type: 'white_collar' | 'specialist' | 'generalist';
  role: string;
  capabilities: string[];
  status: 'training' | 'ready' | 'deployed' | 'inactive';
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    cost_efficiency: number;
    human_comparison: number;
  };
  config: {
    model: string;
    temperature: number;
    max_tokens: number;
    tools: string[];
    memory_config: {
      short_term: boolean;
      long_term: boolean;
      context_window: number;
    };
  };
}

interface TestChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function ManageAIEmployees() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [testMessages, setTestMessages] = useState<TestChatMessage[]>([]);
  const [testInput, setTestInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchTerm, statusFilter, typeFilter, sortBy]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/forge1/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(agent => agent.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "created":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "performance":
          const aPerf = (a.performance.accuracy + a.performance.speed + a.performance.reliability) / 3;
          const bPerf = (b.performance.accuracy + b.performance.speed + b.performance.reliability) / 3;
          return bPerf - aPerf;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  const getAgentStats = () => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'ready' || a.status === 'deployed').length;
    const training = agents.filter(a => a.status === 'training').length;
    const avgPerformance = agents.length > 0 
      ? agents.reduce((sum, agent) => sum + (agent.performance.accuracy + agent.performance.speed + agent.performance.reliability) / 3, 0) / agents.length 
      : 0;
    
    return { total, active, training, avgPerformance: Math.round(avgPerformance * 100) };
  };

  const agentStats = getAgentStats();

  const deployAgent = async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch('/api/forge1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy_agent', agentId })
      });
      const data = await response.json();
      if (data.success) {
        fetchAgents();
        toast({
          title: "Success!",
          description: "Agent deployed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to deploy agent: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deploying agent:', error);
      toast({
        title: "Error",
        description: "Failed to deploy agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const trainAgent = async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch('/api/forge1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'train_agent', agentId })
      });
      const data = await response.json();
      if (data.success) {
        fetchAgents();
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(data.agent);
        }
        toast({
          title: "Success!",
          description: "Agent training completed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to train agent: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error training agent:', error);
      toast({
        title: "Error",
        description: "Failed to train agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const deleteAgent = async (agentId: string) => {
    toast({
      title: "Confirm Delete",
      description: "Are you sure you want to delete this AI employee?",
      action: (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              toast.dismiss(); // Dismiss the confirmation toast
              performDelete(agentId);
            }}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </Button>
        </div>
      ),
      duration: Infinity, // Keep the toast open until user action
    });
  };

  const performDelete = async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch('/api/forge1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_agent', agentId })
      });
      const data = await response.json();
      if (data.success) {
        fetchAgents();
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(null);
        }
        toast({
          title: "Success!",
          description: "AI employee deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to delete AI employee: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete AI employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const testAgent = async () => {
    if (!selectedAgent || !testInput.trim()) return;

    const userMessage: TestChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: testInput,
      timestamp: new Date()
    };

    setTestMessages(prev => [...prev, userMessage]);
    setTestInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/forge1/test-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: selectedAgent.id, 
          message: testInput,
          conversationId: conversationId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const agentMessage: TestChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: data.response,
          timestamp: new Date()
        };
        setTestMessages(prev => [...prev, agentMessage]);
        
        // Update conversation ID if this is a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
      } else {
        const errorMessage: TestChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: `Error: ${data.error}`,
          timestamp: new Date()
        };
        setTestMessages(prev => [...prev, errorMessage]);
        toast({
          title: "Error",
          description: `Failed to get response from agent: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      const errorMessage: TestChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setTestMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to communicate with agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deployed':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'training':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <Pause className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Dashboard Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{agentStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{agentStats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{agentStats.training}</p>
                <p className="text-xs text-muted-foreground">Training</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{agentStats.avgPerformance}%</p>
                <p className="text-xs text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>AI Employees Management</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const tabsList = document.querySelector('[value="create"]');
                  if (tabsList) {
                    (tabsList as HTMLElement).click();
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
              <Button variant="outline" size="sm" onClick={fetchAgents}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search employees by name, role, or capabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="white_collar">White Collar</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="generalist">Generalist</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Employees ({filteredAgents.length})</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No AI employees found</p>
                    <p className="text-sm">Try adjusting your filters or create a new employee</p>
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAgent?.id === agent.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setTestMessages([]);
                        setConversationId(null);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{agent.name}</h3>
                          <p className="text-xs text-gray-500">{agent.role}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(agent.status)}
                          <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 2).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Performance</span>
                          <span>{Math.round((agent.performance.accuracy + agent.performance.speed + agent.performance.reliability) / 3 * 100)}%</span>
                        </div>
                        <Progress 
                          value={(agent.performance.accuracy + agent.performance.speed + agent.performance.reliability) / 3 * 100} 
                          className="h-1" 
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Details & Testing */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="test">Test Agent</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="w-5 h-5" />
                          <span>{selectedAgent.name}</span>
                        </CardTitle>
                        <CardDescription>{selectedAgent.role}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedAgent.status)}
                        <Badge className={getStatusColor(selectedAgent.status)}>
                          {selectedAgent.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Model:</span>
                          <span className="ml-2 font-medium">{selectedAgent.config.model}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Temperature:</span>
                          <span className="ml-2 font-medium">{selectedAgent.config.temperature}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Tokens:</span>
                          <span className="ml-2 font-medium">{selectedAgent.config.max_tokens}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{selectedAgent.type}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Available Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.config.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <div className="space-x-2">
                          {selectedAgent.status === 'training' && (
                            <Button
                              onClick={() => trainAgent(selectedAgent.id)}
                              size="sm"
                              disabled={actionLoading[selectedAgent.id]}
                            >
                              {actionLoading[selectedAgent.id] ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <Brain className="w-4 h-4 mr-2" />
                              )}
                              Train Agent
                            </Button>
                          )}
                          {selectedAgent.status === 'ready' && (
                            <Button
                              onClick={() => deployAgent(selectedAgent.id)}
                              size="sm"
                              disabled={actionLoading[selectedAgent.id]}
                            >
                              {actionLoading[selectedAgent.id] ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <Play className="w-4 h-4 mr-2" />
                              )}
                              Deploy
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Agent configuration functionality will be available soon!",
                              });
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                        <Button
                          onClick={() => deleteAgent(selectedAgent.id)}
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading[selectedAgent.id]}
                        >
                          {actionLoading[selectedAgent.id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                    <CardDescription>
                      Current performance metrics compared to human baseline
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedAgent.performance).map(([metric, value]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{metric.replace('_', ' ')}</span>
                          <span className="font-medium">{Math.round(value * 100)}%</span>
                        </div>
                        <Progress value={value * 100} className="h-2" />
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <strong>Human Comparison:</strong> {Math.round(selectedAgent.performance.human_comparison * 100)}% 
                        {selectedAgent.performance.human_comparison > 1 ? ' better than human' : ' of human performance'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Test Agent</span>
                    </CardTitle>
                    <CardDescription>
                      Interact with your AI employee to test its capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-3 bg-gray-50">
                      {testMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Send a message to test your AI employee</p>
                        </div>
                      ) : (
                        testMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                message.type === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white border'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border px-3 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Ask your AI employee a question..."
                        onKeyPress={(e) => e.key === 'Enter' && testAgent()}
                      />
                      <Button onClick={testAgent} disabled={isLoading || !testInput.trim()}>
                        <Zap className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Select an AI Employee</h3>
                  <p className="text-gray-400">Choose an AI employee from the list to view details and test its capabilities</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}