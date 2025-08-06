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
  Image, 
  Activity, 
  Settings, 
  Upload,
  Eye,
  Mic,
  Video,
  FileText,
  BarChart3,
  Zap,
  Camera,
  Music,
  Film,
  TrendingUp
} from "lucide-react";

interface Model {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: string;
  max_tokens: number | null;
  supported_formats: string[];
  performance: {
    accuracy: number;
    speed: number;
    cost_efficiency: number;
  };
}

interface ProcessingStats {
  active_sessions: number;
  total_processed: number;
  avg_processing_time: number;
  success_rate: number;
  modalities_used: Record<string, number>;
  current_load: number;
}

interface SupportedFormat {
  type: string;
  formats: string[];
  max_size: number;
  description: string;
}

export default function MultimodalLayer() {
  const [models, setModels] = useState<Model[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [supportedFormats, setSupportedFormats] = useState<SupportedFormat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState<any>(null);
  const [audioDescription, setAudioDescription] = useState('');
  const [audioResult, setAudioResult] = useState<any>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');

  useEffect(() => {
    fetchModels();
    fetchProcessingStats();
    fetchSupportedFormats();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/forge1/multimodal?action=models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchProcessingStats = async () => {
    try {
      const response = await fetch('/api/forge1/multimodal?action=processing');
      const data = await response.json();
      setProcessingStats(data);
    } catch (error) {
      console.error('Error fetching processing stats:', error);
    }
  };

  const fetchSupportedFormats = async () => {
    try {
      const response = await fetch('/api/forge1/multimodal?action=formats');
      const data = await response.json();
      setSupportedFormats(data.supported_formats);
    } catch (error) {
      console.error('Error fetching supported formats:', error);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_image',
          data: { prompt: imagePrompt }
        })
      });
      
      const result = await response.json();
      setImageResult(result);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAudio = async () => {
    if (!audioDescription.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_audio',
          data: { 
            audio_url: 'sample_audio.mp3',
            description: audioDescription 
          }
        })
      });
      
      const result = await response.json();
      setAudioResult(result);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'multimodal': return <Image className="w-4 h-4" alt="" />;
      case 'vision': return <Eye className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'image_generation': return <Camera className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" alt="" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-pink-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-pink-500 bg-opacity-10">
                <Image className="w-6 h-6 text-pink-600" alt="" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Multimodal Layer</span>
                  <Badge variant="outline">GPT-4o multimodal OR plug-ins</Badge>
                </CardTitle>
                <CardDescription>
                  Image, vision, audio input/output
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchModels();
                  fetchProcessingStats();
                  fetchSupportedFormats();
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
              <div className="text-2xl font-bold text-pink-600">
                {processingStats?.active_sessions || 0}
              </div>
              <div className="text-sm text-slate-600">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {processingStats?.total_processed?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-600">Total Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {processingStats?.avg_processing_time || 0}ms
              </div>
              <div className="text-sm text-slate-600">Avg Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(processingStats?.success_rate * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" alt="" />
                <span>Multimodal Models</span>
              </CardTitle>
              <CardDescription>
                Available AI models for multimodal processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {models.map((model) => (
                  <Card key={model.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-pink-100">
                            {getModelIcon(model.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{model.name}</h4>
                              <Badge variant="outline">{model.type}</Badge>
                              <Badge 
                                variant={model.status === 'active' ? 'default' : 'secondary'}
                              >
                                {model.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {model.capabilities.map((capability, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Formats: {model.supported_formats.length}</span>
                              {model.max_tokens && (
                                <span>Max tokens: {model.max_tokens.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Accuracy</span>
                              <span>{(model.performance.accuracy * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={model.performance.accuracy * 100} className="h-1" />
                          </div>
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Speed</span>
                              <span>{(model.performance.speed * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={model.performance.speed * 100} className="h-1" />
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

        <TabsContent value="generation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Image Generation</span>
                </CardTitle>
                <CardDescription>
                  Generate images from text prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="Describe the image you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <Select defaultValue="1024x1024">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256x256">256x256</SelectItem>
                        <SelectItem value="512x512">512x512</SelectItem>
                        <SelectItem value="1024x1024">1024x1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateImage}
                  disabled={isLoading || !imagePrompt.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate Image'}
                </Button>
                
                {imageResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Generation Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-slate-600">Generation ID: </span><span className="font-medium">{imageResult.generation_id}</span></div>
                        <div><span className="text-slate-600">Model: </span><span className="font-medium">{imageResult.model}</span></div>
                        <div><span className="text-slate-600">Size: </span><span className="font-medium">{imageResult.results.size}</span></div>
                        <div><span className="text-slate-600">Processing Time: </span><span className="font-medium">{imageResult.results.processing_time}ms</span></div>
                        <div><span className="text-slate-600">Image URL: </span><span className="font-medium text-blue-600">{imageResult.results.image_url}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5" />
                  <span>Audio Processing</span>
                </CardTitle>
                <CardDescription>
                  Process and transcribe audio files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Audio Description</label>
                  <Textarea
                    placeholder="Describe the audio content..."
                    value={audioDescription}
                    onChange={(e) => setAudioDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleProcessAudio}
                  disabled={isLoading || !audioDescription.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Process Audio'}
                </Button>
                
                {audioResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Processing Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-slate-600">Processing ID: </span><span className="font-medium">{audioResult.processing_id}</span></div>
                        <div><span className="text-slate-600">Model: </span><span className="font-medium">{audioResult.model}</span></div>
                        <div><span className="text-slate-600">Language: </span><span className="font-medium">{audioResult.results.language}</span></div>
                        <div><span className="text-slate-600">Duration: </span><span className="font-medium">{audioResult.results.duration}s</span></div>
                        <div><span className="text-slate-600">Confidence: </span><span className="font-medium">{(audioResult.results.confidence * 100).toFixed(1)}%</span></div>
                        <div>
                          <span className="text-slate-600">Transcription: </span>
                          <p className="font-medium mt-1">{audioResult.results.transcription}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Multimodal Analysis</span>
              </CardTitle>
              <CardDescription>
                Analyze content across multiple modalities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Image className="w-6 h-6 mb-2" alt="" />
                  <span>Image Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Film className="w-6 h-6 mb-2" />
                  <span>Video Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>Document Analysis</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Prompt</label>
                <Textarea
                  placeholder="Describe what you want to analyze..."
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button disabled={isLoading || !analysisPrompt.trim()} className="w-full">
                {isLoading ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Supported Formats</span>
              </CardTitle>
              <CardDescription>
                File formats supported by multimodal processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {supportedFormats.map((format) => (
                  <Card key={format.type} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            {format.type === 'image' && <Image className="w-4 h-4" alt="" />}
                            {format.type === 'audio' && <Music className="w-4 h-4" />}
                            {format.type === 'video' && <Film className="w-4 h-4" />}
                            {format.type === 'document' && <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium capitalize">{format.type}</h4>
                              <Badge variant="outline">{format.formats.length} formats</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{format.description}</p>
                            <div className="text-sm text-slate-500 mt-1">
                              Max size: {(format.max_size / 1024 / 1024).toFixed(1)}MB
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {format.formats.join(', ')}
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

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Multimodal Analytics</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and usage analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {(processingStats?.success_rate * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={processingStats?.success_rate * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Load</span>
                      <span className="font-medium">
                        {(processingStats?.current_load * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={processingStats?.current_load * 100 || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Modality Usage</h4>
                  <div className="space-y-3">
                    {processingStats && Object.entries(processingStats.modalities_used).map(([modality, count]) => (
                      <div key={modality} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{modality}</span>
                          <span className="font-medium">{count?.toLocaleString() || 0}</span>
                        </div>
                        <Progress 
                          value={(count / Math.max(...Object.values(processingStats.modalities_used))) * 100} 
                          className="h-1" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Processing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Image generated</span>
                      <span className="text-slate-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio transcribed</span>
                      <span className="text-slate-500">5 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video analyzed</span>
                      <span className="text-slate-500">8 minutes ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multimodal analysis</span>
                      <span className="text-slate-500">12 minutes ago</span>
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