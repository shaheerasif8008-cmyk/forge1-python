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
  Heart, 
  Brain, 
  Smile, 
  Frown, 
  Meh, 
  Activity,
  Users,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { EmotionalAIService, EmotionalAnalysis, EmotionalProfile, EmotionalConversation } from "../service";

const emotionalAIService = new EmotionalAIService();

export default function EmotionalAIDashboard() {
  const [analyses, setAnalyses] = useState<EmotionalAnalysis[]>([]);
  const [profiles, setProfiles] = useState<EmotionalProfile[]>([]);
  const [conversations, setConversations] = useState<EmotionalConversation[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<EmotionalProfile | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<EmotionalConversation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<EmotionalAnalysis['content_type']>('text');
  const [analysisType, setAnalysisType] = useState<EmotionalAnalysis['analysis_type']>('emotion_detection');
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [targetEmotion, setTargetEmotion] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");

  useEffect(() => {
    loadAnalyses();
    loadProfiles();
    loadConversations();
  }, []);

  const loadAnalyses = async () => {
    // In production, load from API
    const mockAnalyses: EmotionalAnalysis[] = [
      {
        id: "analysis_1",
        content_type: "text",
        content: "I'm really excited about this new opportunity!",
        analysis_type: "emotion_detection",
        result: {
          primary_emotion: {
            emotion: "excitement",
            intensity: 0.8,
            confidence: 0.9,
            description: "Strong positive emotion with enthusiasm"
          },
          sentiment: {
            polarity: "positive",
            score: 0.7,
            confidence: 0.85
          }
        },
        confidence: 0.88,
        processing_time: 1200,
        created_at: new Date()
      }
    ];
    setAnalyses(mockAnalyses);
  };

  const loadProfiles = async () => {
    const profileList = await emotionalAIService.getEmotionalProfiles();
    setProfiles(profileList);
  };

  const loadConversations = async () => {
    // In production, load from API
    const mockConversations: EmotionalConversation[] = [
      {
        id: "conv_1",
        participant_a: "Alice",
        participant_b: "Bob",
        messages: [],
        emotional_flow: [],
        overall_sentiment: {
          polarity: "positive",
          score: 0.6,
          confidence: 0.8
        },
        conflict_points: [],
        created_at: new Date()
      }
    ];
    setConversations(mockConversations);
  };

  const handleAnalyzeEmotion = async () => {
    if (!content) return;

    setIsAnalyzing(true);
    try {
      const analysis = await emotionalAIService.analyzeEmotion(content, contentType, analysisType);
      setAnalyses(prev => [analysis, ...prev]);
      setSelectedAnalysis(analysis);
      setContent("");
    } catch (error) {
      console.error('Emotional analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!content || !targetEmotion) return;

    setIsGenerating(true);
    try {
      const response = await emotionalAIService.generateEmotionalResponse(content, targetEmotion);
      setGeneratedResponse(response);
    } catch (error) {
      console.error('Response generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase();
    if (lowerEmotion.includes('joy') || lowerEmotion.includes('happy') || lowerEmotion.includes('excited')) {
      return <Smile className="w-4 h-4 text-yellow-500" />;
    } else if (lowerEmotion.includes('sad') || lowerEmotion.includes('angry') || lowerEmotion.includes('fear')) {
      return <Frown className="w-4 h-4 text-blue-500" />;
    } else {
      return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Emotional AI Layer</h2>
          <p className="text-muted-foreground">
            Advanced emotion detection with CallMind and trained LLM models
          </p>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Emotion Analysis</TabsTrigger>
          <TabsTrigger value="profiles">Emotional Profiles</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="response">Response Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Analyze Emotion</span>
                </CardTitle>
                <CardDescription>
                  Detect emotions and sentiment in content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="speech">Speech</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="conversation">Conversation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="analysisType">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emotion_detection">Emotion Detection</SelectItem>
                      <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
                      <SelectItem value="personality_analysis">Personality Analysis</SelectItem>
                      <SelectItem value="mood_tracking">Mood Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content to Analyze</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter content to analyze for emotions"
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeEmotion} 
                  disabled={isAnalyzing || !content}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Emotion"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>
                  View recent emotional analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnalysis?.id === analysis.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEmotionIcon(analysis.result.primary_emotion.emotion)}
                          <span className="font-medium capitalize">{analysis.result.primary_emotion.emotion}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(analysis.result.sentiment.polarity)}
                          <Badge variant="outline" className={getSentimentColor(analysis.result.sentiment.polarity)}>
                            {Math.round(analysis.result.sentiment.score * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analysis.content_type} • {analysis.analysis_type.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Intensity: {Math.round(analysis.result.primary_emotion.intensity * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Profile</span>
                </CardTitle>
                <CardDescription>
                  Create emotional profile for user analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter profile name"
                  />
                </div>
                <div>
                  <Label htmlFor="profileDescription">Description</Label>
                  <Textarea
                    id="profileDescription"
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    placeholder="Describe the emotional profile"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => {
                    // Handle profile creation
                    setProfileName("");
                    setProfileDescription("");
                  }}
                  disabled={!profileName || !profileDescription}
                  className="w-full"
                >
                  Create Profile
                </Button>
              </CardContent>
            </Card>

            {/* Profiles List */}
            <Card>
              <CardHeader>
                <CardTitle>Emotional Profiles</CardTitle>
                <CardDescription>
                  User emotional profiles and baselines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProfile?.id === profile.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{profile.name}</div>
                        <Badge variant="outline">
                          {profile.personality_profile.length} traits
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{profile.communication_style}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {profile.baseline_emotions.length} baseline emotions
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversation Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversation Analysis</span>
                </CardTitle>
                <CardDescription>
                  Analyze emotional flow in conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Sample Conversation</Label>
                    <div className="p-3 border rounded bg-gray-50 text-sm">
                      <div><strong>Alice:</strong> I'm really excited about this project!</div>
                      <div><strong>Bob:</strong> That's great! I think it will be successful.</div>
                      <div><strong>Alice:</strong> Thanks for your support!</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      // Handle conversation analysis
                    }}
                    className="w-full"
                  >
                    Analyze Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conversations List */}
            <Card>
              <CardHeader>
                <CardTitle>Analyzed Conversations</CardTitle>
                <CardDescription>
                  Conversation emotional analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {conversation.participant_a} & {conversation.participant_b}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(conversation.overall_sentiment.polarity)}
                          <Badge variant="outline" className={getSentimentColor(conversation.overall_sentiment.polarity)}>
                            {Math.round(conversation.overall_sentiment.score * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {conversation.messages.length} messages • {conversation.conflict_points.length} conflicts
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {conversation.created_at.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="response" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Generate Response</span>
                </CardTitle>
                <CardDescription>
                  Generate emotionally intelligent responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inputContent">Input Content</Label>
                  <Textarea
                    id="inputContent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the content you want to respond to"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="targetEmotion">Target Emotion</Label>
                  <Select value={targetEmotion} onValueChange={setTargetEmotion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                      <SelectItem value="supportive">Supportive</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="calming">Calming</SelectItem>
                      <SelectItem value="encouraging">Encouraging</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateResponse} 
                  disabled={isGenerating || !content || !targetEmotion}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Response"}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Generated Response</span>
                </CardTitle>
                <CardDescription>
                  AI-generated emotionally intelligent response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedResponse ? (
                  <Textarea
                    value={generatedResponse}
                    readOnly
                    rows={8}
                    className="resize-none"
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Generate a response to see it here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}