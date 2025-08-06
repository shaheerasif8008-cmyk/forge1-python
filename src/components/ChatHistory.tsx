"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  User,
  Bot,
  Calendar,
  Tag,
  BarChart3,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
  tags?: string[];
}

interface ChatMessage {
  id: string;
  sessionId: string;
  agentId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    confidence?: number;
    processingTime?: number;
    multiLLM?: boolean;
    collaborationMode?: string;
    emotion?: string;
    tone?: string;
    topic?: string;
    tags?: string[];
  };
}

interface ChatAnalytics {
  totalSessions: number;
  totalMessages: number;
  averageMessagesPerSession: number;
  topTopics: Array<{ topic: string; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
  emotionDistribution: Array<{ emotion: string; count: number }>;
}

interface ChatHistoryProps {
  agentId?: string;
  agentName?: string;
}

export default function ChatHistory({ agentId, agentName }: ChatHistoryProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("sessions");

  useEffect(() => {
    if (agentId) {
      loadSessions();
      loadAnalytics();
    }
  }, [agentId]);

  const loadSessions = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/forge1/chat-history?action=get_sessions&agentId=${agentId}`);
      const result = await response.json();
      
      if (result.success) {
        setSessions(result.sessions);
      } else {
        toast({
          title: "Error",
          description: "Failed to load chat sessions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forge1/chat-history?action=get_messages&sessionId=${sessionId}`);
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.messages);
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!agentId) return;
    
    try {
      const response = await fetch(`/api/forge1/chat-history?action=get_analytics&agentId=${agentId}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createNewSession = async () => {
    if (!agentId) return;
    
    try {
      const response = await fetch('/api/forge1/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          data: {
            agentId,
            title: `Chat with ${agentName || 'AI Agent'} - ${new Date().toLocaleDateString()}`
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSessions(prev => [result.session, ...prev]);
        setSelectedSession(result.session);
        setMessages([]);
        toast({
          title: "Session Created",
          description: "New chat session started",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/forge1/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_session',
          data: { sessionId }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }
        toast({
          title: "Session Deleted",
          description: "Chat session deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const exportChatHistory = async (format: 'json' | 'csv') => {
    if (!agentId) return;
    
    try {
      const response = await fetch(`/api/forge1/chat-history?action=export&agentId=${agentId}&format=${format}`);
      
      if (format === 'json') {
        const result = await response.json();
        if (result.success) {
          const blob = new Blob([result.data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'chat-history.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Chat history exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting chat history:', error);
      toast({
        title: "Error",
        description: "Failed to export chat history",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <User className="w-4 h-4" />;
      case 'assistant': return <Bot className="w-4 h-4" />;
      case 'system': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assistant': return 'bg-green-100 text-green-800 border-green-200';
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Chat History</span>
            {agentName && <Badge variant="outline">{agentName}</Badge>}
          </CardTitle>
          <CardDescription>
            View and manage conversation history with AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createNewSession} disabled={!agentId}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => exportChatHistory('json')}
                    disabled={!agentId}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No chat sessions found
                  </div>
                ) : (
                  sessions
                    .filter(session => 
                      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      session.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((session) => (
                      <Card 
                        key={session.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedSession(session);
                          loadMessages(session.id);
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{session.title}</h3>
                                <Badge variant="outline">{session.messageCount} messages</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {session.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500">
                                {formatTimestamp(session.updatedAt)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {!selectedSession ? (
                <div className="text-center py-8 text-gray-500">
                  Select a session to view messages
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{selectedSession.title}</h3>
                      <p className="text-sm text-gray-600">
                        {messages.length} messages
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatTimestamp(selectedSession.updatedAt)}
                    </Badge>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No messages in this session
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getRoleIcon(message.role)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getRoleColor(message.role)}`}
                              >
                                {message.role}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {message.metadata?.model && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.metadata.model}
                                </Badge>
                              )}
                              {message.metadata?.multiLLM && (
                                <Badge variant="outline" className="text-xs">
                                  Multi-LLM
                                </Badge>
                              )}
                            </div>
                            <div className="bg-white border rounded-lg p-3">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.metadata?.emotion && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>Emotion: {message.metadata.emotion}</span>
                                {message.metadata?.confidence && (
                                  <span>Confidence: {(message.metadata.confidence * 100).toFixed(1)}%</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Sessions</span>
                        <span className="font-medium">{analytics.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Messages</span>
                        <span className="font-medium">{analytics.totalMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Messages/Session</span>
                        <span className="font-medium">{analytics.averageMessagesPerSession.toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Top Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.topTopics.slice(0, 5).map((topic, index) => (
                          <div key={topic.topic} className="flex justify-between items-center">
                            <span className="text-sm">{topic.topic}</span>
                            <Badge variant="secondary">{topic.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Emotion Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.emotionDistribution.slice(0, 5).map((emotion, index) => (
                          <div key={emotion.emotion} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{emotion.emotion}</span>
                            <Badge variant="secondary">{emotion.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No analytics data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}