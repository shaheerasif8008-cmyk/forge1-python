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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  Camera, 
  FileText, 
  LayoutGrid, 
  Brain, 
  Image as ImageIcon, 
  Scale,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Upload
} from "lucide-react";
import { VisionService, VisionAnalysis, VisionResult } from "../service";

const visionService = new VisionService();

export default function VisionDashboard() {
  const [analyses, setAnalyses] = useState<VisionAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<VisionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Form states
  const [imageUrl, setImageUrl] = useState("");
  const [analysisTypes, setAnalysisTypes] = useState({
    object_detection: true,
    ocr: false,
    layout_parsing: false,
    scene_understanding: false
  });
  const [compareImageUrl1, setCompareImageUrl1] = useState("");
  const [compareImageUrl2, setCompareImageUrl2] = useState("");

  useEffect(() => {
    loadVisionAnalyses();
  }, []);

  const loadVisionAnalyses = async () => {
    // In production, load from API
    const mockAnalyses: VisionAnalysis[] = [
      {
        id: "vision_1",
        image_url: "https://example.com/image1.jpg",
        analysis_type: "object_detection",
        results: [
          {
            type: "object",
            label: "person",
            confidence: 0.95,
            bbox: { x: 0.1, y: 0.1, width: 0.3, height: 0.6 },
            attributes: { color: "blue", position: "standing" }
          }
        ],
        confidence: 0.95,
        processing_time: 1200,
        created_at: new Date()
      }
    ];
    setAnalyses(mockAnalyses);
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    try {
      const selectedTypes = Object.entries(analysisTypes)
        .filter(([_, selected]) => selected)
        .map(([type, _]) => type as any);

      const analysis = await visionService.analyzeImage(imageUrl, selectedTypes);
      setAnalyses(prev => [analysis, ...prev]);
      setSelectedAnalysis(analysis);
      setImageUrl("");
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedAnalysis) return;

    try {
      const description = await visionService.generateImageDescription(selectedAnalysis.image_url);
      setImageDescription(description);
    } catch (error) {
      console.error('Failed to generate description:', error);
    }
  };

  const handleCompareImages = async () => {
    if (!compareImageUrl1 || !compareImageUrl2) return;

    setIsComparing(true);
    try {
      const result = await visionService.compareImages(compareImageUrl1, compareImageUrl2);
      setComparisonResult(result);
    } catch (error) {
      console.error('Failed to compare images:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleAnalysisTypeChange = (type: keyof typeof analysisTypes, checked: boolean) => {
    setAnalysisTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'object_detection':
        return <Target className="w-4 h-4" />;
      case 'ocr':
        return <FileText className="w-4 h-4" />;
      case 'layout_parsing':
        return <LayoutGrid className="w-4 h-4" />;
      case 'scene_understanding':
        return <Brain className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return <Target className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'layout':
        return <LayoutGrid className="w-4 h-4" />;
      case 'scene':
        return <Brain className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vision Beyond Images</h2>
          <p className="text-muted-foreground">
            Advanced computer vision with GPT-4o, GroundingDINO, and CLIP
          </p>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Image Analysis</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="description">Image Description</TabsTrigger>
          <TabsTrigger value="comparison">Image Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Analyze Image</span>
                </CardTitle>
                <CardDescription>
                  Upload or provide image URL for advanced analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div>
                  <Label>Analysis Types</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(analysisTypes).map(([type, selected]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selected}
                          onCheckedChange={(checked) => 
                            handleAnalysisTypeChange(type as keyof typeof analysisTypes, checked as boolean)
                          }
                        />
                        <label htmlFor={type} className="flex items-center space-x-2 text-sm">
                          {getAnalysisTypeIcon(type)}
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyzeImage} 
                  disabled={isAnalyzing || !imageUrl || !Object.values(analysisTypes).some(v => v)}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>
                  Select an analysis to view detailed results
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
                          {getAnalysisTypeIcon(analysis.analysis_type)}
                          <span className="font-medium capitalize">
                            {analysis.analysis_type.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {Math.round(analysis.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analysis.results.length} results • {analysis.processing_time}ms
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {analysis.created_at.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Detailed results from image analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedAnalysis.results.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedAnalysis.confidence * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedAnalysis.processing_time}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedAnalysis.results.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getResultTypeIcon(result.type)}
                            <span className="font-medium capitalize">{result.type}</span>
                          </div>
                          <Badge variant="outline">
                            {Math.round(result.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {result.label}
                        </div>
                        
                        {result.text && (
                          <div className="text-sm text-blue-600 mb-2">
                            Text: "{result.text}"
                          </div>
                        )}
                        
                        {result.bbox && (
                          <div className="text-xs text-gray-500 mb-2">
                            Bounding Box: x={result.bbox.x.toFixed(2)}, y={result.bbox.y.toFixed(2)}, 
                            w={result.bbox.width.toFixed(2)}, h={result.bbox.height.toFixed(2)}
                          </div>
                        )}
                        
                        {result.attributes && Object.keys(result.attributes).length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-600 mb-1">Attributes:</div>
                            <div className="text-xs text-gray-500">
                              {Object.entries(result.attributes).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select an analysis to view detailed results
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Generate Description</span>
                </CardTitle>
                <CardDescription>
                  Create natural language descriptions of images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Image</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedAnalysis ? (
                      <div>
                        <div className="font-medium">Analysis ID: {selectedAnalysis.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {selectedAnalysis.analysis_type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          URL: {selectedAnalysis.image_url}
                        </div>
                      </div>
                    ) : (
                      "No analysis selected"
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateDescription} 
                  disabled={!selectedAnalysis}
                  className="w-full"
                >
                  Generate Description
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Description</CardTitle>
                <CardDescription>
                  Natural language description of the image
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageDescription ? (
                  <Textarea
                    value={imageDescription}
                    readOnly
                    rows={10}
                    className="resize-none"
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Generate a description to see it here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5" />
                  <span>Compare Images</span>
                </CardTitle>
                <CardDescription>
                  Compare two images for similarity and differences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="compareImageUrl1">Image 1 URL</Label>
                  <Input
                    id="compareImageUrl1"
                    value={compareImageUrl1}
                    onChange={(e) => setCompareImageUrl1(e.target.value)}
                    placeholder="Enter first image URL"
                  />
                </div>
                
                <div>
                  <Label htmlFor="compareImageUrl2">Image 2 URL</Label>
                  <Input
                    id="compareImageUrl2"
                    value={compareImageUrl2}
                    onChange={(e) => setCompareImageUrl2(e.target.value)}
                    placeholder="Enter second image URL"
                  />
                </div>

                <Button 
                  onClick={handleCompareImages} 
                  disabled={isComparing || !compareImageUrl1 || !compareImageUrl2}
                  className="w-full"
                >
                  {isComparing ? "Comparing..." : "Compare Images"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparison Results</CardTitle>
                <CardDescription>
                  Similarity analysis and differences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.round(comparisonResult.similarity * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Similarity Score</div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Differences:</div>
                      <div className="space-y-1">
                        {comparisonResult.differences.map((diff: string, index: number) => (
                          <div key={index} className="text-sm text-red-600">
                            • {diff}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Common Elements:</div>
                      <div className="space-y-1">
                        {comparisonResult.common_elements.map((element: string, index: number) => (
                          <div key={index} className="text-sm text-green-600">
                            • {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Compare two images to see results
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