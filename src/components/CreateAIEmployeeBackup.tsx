"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MultiLLMConfigurator, { MultiLLMConfig } from "@/components/MultiLLMConfigurator";

interface AIEmployeeFormData {
  name: string;
  role: string;
  type: 'white_collar' | 'specialist' | 'generalist';
  model: string;
  temperature: number;
  maxTokens: number;
  capabilities: string[];
  tools: string[];
  memoryConfig: {
    short_term: boolean;
    long_term: boolean;
    context_window: number;
  };
  multiLLMConfig?: MultiLLMConfig;
  useMultiLLM: boolean;
}

const CAPABILITIES = [
  'Financial Analysis', 'Legal Research', 'Data Analysis', 'Report Generation',
  'Customer Service', 'Market Research', 'Project Management', 'Content Creation',
  'Code Review', 'Quality Assurance', 'Risk Assessment', 'Compliance Check'
];

const TOOLS = [
  'web_search', 'calculator', 'data_analyzer', 'document_parser',
  'legal_database', 'compliance_checker', 'code_executor', 'file_manager'
];

const TEMPLATES = [
  { name: 'Financial Analyst', icon: '💼', role: 'Senior Financial Analyst' },
  { name: 'Legal Assistant', icon: '⚖️', role: 'Legal Document Specialist' },
  { name: 'Data Scientist', icon: '📊', role: 'Data Analysis Specialist' },
  { name: 'Research Analyst', icon: '🎓', role: 'Market Research Specialist' },
  { name: 'Content Writer', icon: '📝', role: 'Content Creation Specialist' },
];

export default function CreateAIEmployee() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AIEmployeeFormData>({
    name: '',
    role: '',
    type: 'white_collar',
    model: 'gpt-o1',
    temperature: 0.1,
    maxTokens: 4000,
    capabilities: [],
    tools: [],
    memoryConfig: {
      short_term: true,
      long_term: true,
      context_window: 32000
    },
    useMultiLLM: false
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: keyof AIEmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiLLMConfigChange = (config: MultiLLMConfig) => {
    setFormData(prev => ({
      ...prev,
      multiLLMConfig: config
    }));
  };

  const handleCapabilityChange = (capability: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      capabilities: checked 
        ? [...prev.capabilities, capability]
        : prev.capabilities.filter(c => c !== capability)
    }));
  };

  const handleToolChange = (tool: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: checked 
        ? [...prev.tools, tool]
        : prev.tools.filter(t => t !== tool)
    }));
  };

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      role: template.role,
      capabilities: getTemplateCapabilities(template.name)
    }));
  };

  const getTemplateCapabilities = (templateName: string): string[] => {
    switch (templateName) {
      case 'Financial Analyst':
        return ['Financial Analysis', 'Risk Assessment', 'Market Research', 'Report Generation'];
      case 'Legal Assistant':
        return ['Legal Research', 'Compliance Check', 'Document Generation', 'Risk Assessment'];
      case 'Data Scientist':
        return ['Data Analysis', 'Report Generation', 'Quality Assurance', 'Market Research'];
      case 'Research Analyst':
        return ['Market Research', 'Data Analysis', 'Report Generation', 'Risk Assessment'];
      case 'Content Writer':
        return ['Content Creation', 'Market Research', 'Report Generation', 'Customer Service'];
      default:
        return [];
    }
  };

  const createAIEmployee = async () => {
    if (!formData.name || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in the employee name and role",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/forge1/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_agent',
          data: {
            name: formData.name,
            type: formData.type,
            role: formData.role,
            status: 'training', // Default status for new agents
            capabilities: formData.capabilities,
            config: {
              model: formData.model,
              temperature: formData.temperature,
              max_tokens: formData.maxTokens,
              tools: formData.tools,
              memory_config: formData.memoryConfig,
              multi_llm_config: formData.useMultiLLM ? formData.multiLLMConfig : undefined
            },
            performance: {
              accuracy: 0.7, // Starting performance
              speed: 0.8,
              reliability: 0.75,
              cost_efficiency: 0.85,
              human_comparison: 0.9
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `AI Employee "${formData.name}" created successfully! The employee is now training and will be ready shortly.`,
        });
        
        // Reset form
        setFormData({
          name: '',
          role: '',
          type: 'white_collar',
          model: 'gpt-o1',
          temperature: 0.1,
          maxTokens: 4000,
          capabilities: [],
          tools: [],
          memoryConfig: {
            short_term: true,
            long_term: true,
            context_window: 32000
          },
          useMultiLLM: false
        });
      } else {
        toast({
          title: "Error",
          description: `Error creating AI Employee: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating AI Employee:', error);
      toast({
        title: "Error",
        description: "Error creating AI Employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Create AI Employee</span>
          </CardTitle>
          <CardDescription>
            Design and deploy your custom AI white-collar employee with specific capabilities and performance requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input 
                  id="employee-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Senior Financial Analyst"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employee-role">Role</Label>
                <Input 
                  id="employee-role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="e.g., Financial Analysis Specialist"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employee-type">Employee Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white_collar">White Collar Professional</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="generalist">Generalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-model">AI Model</Label>
                <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LLM_MODELS).map(([modelId, model]) => (
                      <SelectItem key={modelId} value={modelId}>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {MODEL_PROVIDERS[model.provider]?.name || model.provider}
                            </Badge>
                            <Badge 
                              variant={model.quality === 'premium' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {model.quality}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {model.description}
                          </div>
                          <div className="flex space-x-1 mt-1">
                            {model.speed === 'fast' && (
                              <Badge variant="outline" className="text-xs">⚡ Fast</Badge>
                            )}
                            {model.supportsMultimodal && (
                              <Badge variant="outline" className="text-xs">🖼️ Multimodal</Badge>
                            )}
                            {model.supportsFunctionCalling && (
                              <Badge variant="outline" className="text-xs">🔧 Functions</Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="temperature">Temperature (Creativity)</Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[formData.temperature]}
                  onValueChange={(value) => handleInputChange('temperature', value[0])}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input 
                  id="max-tokens"
                  type="number" 
                  value={formData.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Capabilities</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                {CAPABILITIES.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`capability-${capability}`}
                      checked={formData.capabilities.includes(capability)}
                      onCheckedChange={(checked) => handleCapabilityChange(capability, checked as boolean)}
                    />
                    <Label htmlFor={`capability-${capability}`} className="text-sm font-normal">
                      {capability}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Available Tools</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {TOOLS.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`tool-${tool}`}
                      checked={formData.tools.includes(tool)}
                      onCheckedChange={(checked) => handleToolChange(tool, checked as boolean)}
                    />
                    <Label htmlFor={`tool-${tool}`} className="text-sm font-normal">
                      {tool.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Memory Configuration</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="short-term-memory"
                    checked={formData.memoryConfig.short_term}
                    onCheckedChange={(checked) => handleInputChange('memoryConfig', {
                      ...formData.memoryConfig,
                      short_term: checked as boolean
                    })}
                  />
                  <Label htmlFor="short-term-memory" className="text-sm font-normal">
                    Short-term memory
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="long-term-memory"
                    checked={formData.memoryConfig.long_term}
                    onCheckedChange={(checked) => handleInputChange('memoryConfig', {
                      ...formData.memoryConfig,
                      long_term: checked as boolean
                    })}
                  />
                  <Label htmlFor="long-term-memory" className="text-sm font-normal">
                    Long-term memory
                  </Label>
                </div>
                <div>
                  <Label htmlFor="context-window" className="text-xs text-gray-500">Context Window Size</Label>
                  <Input 
                    id="context-window"
                    type="number" 
                    value={formData.memoryConfig.context_window}
                    onChange={(e) => handleInputChange('memoryConfig', {
                      ...formData.memoryConfig,
                      context_window: parseInt(e.target.value)
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Estimated training time: 2-5 minutes
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Template saving functionality will be available soon!",
                    });
                  }}
                >
                  Save as Template
                </Button>
                <Button 
                  onClick={createAIEmployee}
                  disabled={isCreating || !formData.name || !formData.role}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create AI Employee'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Use pre-configured templates for common AI employee roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <Button 
                key={template.name}
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="w-8 h-8 mb-2">{template.icon}</div>
                <span className="text-sm">{template.name}</span>
              </Button>
            ))}
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Custom template creation functionality will be available soon!",
                });
              }}
            >
              <div className="w-8 h-8 mb-2">🔧</div>
              <span className="text-sm">Custom Template</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}