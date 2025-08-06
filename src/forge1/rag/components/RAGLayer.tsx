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
  Network, 
  Activity, 
  Settings, 
  Search,
  Database,
  BookOpen,
  FileText,
  TrendingUp,
  Target,
  Clock,
  BarChart3
} from "lucide-react";

interface Index {
  id: string;
  name: string;
  type: string;
  documents: number;
  size: string;
  status: string;
  last_updated: string;
}

interface Retriever {
  id: string;
  name: string;
  type: string;
  engine: string;
  accuracy: number;
  speed: number;
  status: string;
}

interface RAGMetrics {
  total_queries: number;
  successful_queries: number;
  avg_retrieval_time: number;
  avg_relevance_score: number;
  embedding_model: string;
  vector_dimension: number;
  total_vectors: number;
}

export default function RAGLayer() {
  const [indices, setIndices] = useState<Index[]>([]);
  const [retrievers, setRetrievers] = useState<Retriever[]>([]);
  const [metrics, setMetrics] = useState<RAGMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [newIndex, setNewIndex] = useState({
    name: '',
    type: 'llamaindex'
  });
  const [documentContent, setDocumentContent] = useState('');

  useEffect(() => {
    fetchIndices();
    fetchRetrievers();
    fetchMetrics();
  }, []);

  const fetchIndices = async () => {
    try {
      const response = await fetch('/api/forge1/rag?action=indices');
      const data = await response.json();
      setIndices(data.indices);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  const fetchRetrievers = async () => {
    try {
      const response = await fetch('/api/forge1/rag?action=retrievers');
      const data = await response.json();
      setRetrievers(data.retrievers);
    } catch (error) {
      console.error('Error fetching retrievers:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/forge1/rag?action=metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query',
          data: { query }
        })
      });
      
      const result = await response.json();
      setQueryResult(result);
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    if (!newIndex.name.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_index',
          data: newIndex
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewIndex({ name: '', type: 'llamaindex' });
        fetchIndices();
      }
    } catch (error) {
      console.error('Error creating index:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndexDocument = async () => {
    if (!documentContent.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'index_document',
          data: {
            content: documentContent,
            metadata: {
              source: 'user_input',
              type: 'document',
              created_at: new Date().toISOString()
            }
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setDocumentContent('');
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error indexing document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEngineIcon = (engine: string) => {
    switch (engine.toLowerCase()) {
      case 'llamaindex': return <BookOpen className="w-4 h-4" />;
      case 'haystack': return <Database className="w-4 h-4" />;
      case 'langchain': return <Network className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500 bg-opacity-10">
                <Network className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>RAG Layer</span>
                  <Badge variant="outline">LangChain + LlamaIndex + Haystack</Badge>
                </CardTitle>
                <CardDescription>
                  Advanced Retrieval-Augmented Generation
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchIndices();
                  fetchRetrievers();
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
              <div className="text-2xl font-bold text-green-600">
                {metrics?.total_queries || 0}
              </div>
              <div className="text-sm text-slate-600">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.avg_retrieval_time || 0}ms
              </div>
              <div className="text-sm text-slate-600">Avg Retrieval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics?.total_vectors || 0}
              </div>
              <div className="text-sm text-slate-600">Vectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(metrics?.avg_relevance_score * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-600">Relevance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="retrievers">Retrievers</TabsTrigger>
          <TabsTrigger value="indexing">Indexing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Document Query</span>
              </CardTitle>
              <CardDescription>
                Search and retrieve relevant documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Query</label>
                <Textarea
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button
                onClick={handleQuery}
                disabled={isLoading || !query.trim()}
                className="w-full"
              >
                {isLoading ? 'Searching...' : 'Search Documents'}
              </Button>
              
              {queryResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Search Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Query ID: </span>
                          <span className="font-medium">{queryResult.query_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Retrieval Time: </span>
                          <span className="font-medium">{queryResult.retrieval_time}ms</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Results: </span>
                          <span className="font-medium">{queryResult.total_results}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Timestamp: </span>
                          <span className="font-medium">{new Date(queryResult.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {queryResult.results.map((result: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-sm">Document {result.document_id}</h5>
                                <p className="text-xs text-slate-500">{result.source}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {(result.score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700">{result.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Document Indices</span>
              </CardTitle>
              <CardDescription>
                Manage and monitor document indices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {indices.map((index) => (
                  <Card key={index.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{index.name}</h4>
                              <Badge variant="outline">{index.type}</Badge>
                              <Badge 
                                variant={index.status === 'active' ? 'default' : 'secondary'}
                              >
                                {index.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>{index.documents.toLocaleString()} docs</span>
                              <span>{index.size}</span>
                              <span>Updated: {new Date(index.last_updated).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retrievers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Retrieval Engines</span>
              </CardTitle>
              <CardDescription>
                Configure and monitor retrieval engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {retrievers.map((retriever) => (
                  <Card key={retriever.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-green-100">
                            {getEngineIcon(retriever.engine)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{retriever.name}</h4>
                              <Badge variant="outline">{retriever.type}</Badge>
                              <Badge 
                                variant={retriever.status === 'active' ? 'default' : 'secondary'}
                              >
                                {retriever.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Engine: {retriever.engine}</span>
                              <span>Accuracy: {(retriever.accuracy * 100).toFixed(1)}%</span>
                              <span>Speed: {(retriever.speed * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Accuracy</span>
                              <span>{(retriever.accuracy * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={retriever.accuracy * 100} className="h-1" />
                          </div>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Speed</span>
                              <span>{(retriever.speed * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={retriever.speed * 100} className="h-1" />
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

        <TabsContent value="indexing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Document Indexing</span>
              </CardTitle>
              <CardDescription>
                Create indices and index documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Create New Index</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Index Name</label>
                    <Input
                      placeholder="Enter index name..."
                      value={newIndex.name}
                      onChange={(e) => setNewIndex({...newIndex, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Index Type</label>
                    <Select value={newIndex.type} onValueChange={(value) => setNewIndex({...newIndex, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llamaindex">LlamaIndex</SelectItem>
                        <SelectItem value="haystack">Haystack</SelectItem>
                        <SelectItem value="langchain">LangChain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateIndex}
                    disabled={isLoading || !newIndex.name.trim()}
                    className="w-full"
                  >
                    {isLoading ? 'Creating...' : 'Create Index'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Index Document</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Content</label>
                    <Textarea
                      placeholder="Paste document content to index..."
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={handleIndexDocument}
                    disabled={isLoading || !documentContent.trim()}
                    className="w-full"
                  >
                    {isLoading ? 'Indexing...' : 'Index Document'}
                  </Button>
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
                <span>RAG Analytics</span>
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
                      <span>Query Success Rate</span>
                      <span className="font-medium">
                        {metrics ? Math.round((metrics.successful_queries / metrics.total_queries) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics ? (metrics.successful_queries / metrics.total_queries) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Relevance Score</span>
                      <span className="font-medium">
                        {(metrics?.avg_relevance_score * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.avg_relevance_score * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">System Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Embedding Model: </span>
                      <span className="font-medium">{metrics?.embedding_model || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Vector Dimension: </span>
                      <span className="font-medium">{metrics?.vector_dimension || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total Vectors: </span>
                      <span className="font-medium">{metrics?.total_vectors?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Avg Retrieval Time: </span>
                      <span className="font-medium">{metrics?.avg_retrieval_time || 0}ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Query executed</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Document indexed</span>
                      <span className="text-slate-500">5 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Index created</span>
                      <span className="text-slate-500">15 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Embeddings updated</span>
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