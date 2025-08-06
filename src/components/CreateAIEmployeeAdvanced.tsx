"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Settings, 
  Network, 
  Plus, 
  Trash2, 
  Save,
  Play,
  Pause,
  Zap,
  User,
  MessageSquare,
  Heart,
  Lightbulb,
  Target,
  BarChart3,
  Mic,
  Volume2,
  Palette,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MultiLLMConfigurator, { MultiLLMConfig } from "@/components/MultiLLMConfigurator";

interface VoiceConfig {
  voice: string;
  pitch: number;
  speed: number;
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'professional';
  accent: 'american' | 'british' | 'australian' | 'neutral';
}

interface EmotionalConfig {
  empathy: number;
  adaptability: number;
  expressiveness: number;
  patience: number;
  humor: number;
  professionalism: number;
}

interface MemoryConfig {
  shortTerm: boolean;
  longTerm: boolean;
  episodic: boolean;
  semantic: boolean;
  workingMemory: number;
  retention: number;
}

interface AppearanceConfig {
  avatar: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  uiStyle: 'minimal' | 'professional' | 'modern' | 'playful';
}

interface AdvancedAIEmployeeFormData {
  // Basic Info
  name: string;
  role: string;
  type: 'white_collar' | 'specialist' | 'generalist' | 'executive' | 'creative';
  description: string;
  
  // Core AI Config
  model: string;
  temperature: number;
  maxTokens: number;
  capabilities: string[];
  tools: string[];
  
  // Multi-LLM Config
  useMultiLLM: boolean;
  multiLLMConfig?: MultiLLMConfig;
  
  // Voice & Communication
  voiceConfig: VoiceConfig;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'empathetic' | 'direct';
  
  // Emotional Intelligence
  emotionalConfig: EmotionalConfig;
  
  // Memory & Learning
  memoryConfig: MemoryConfig;
  learningRate: number;
  adaptationSpeed: number;
  
  // Appearance & UI
  appearanceConfig: AppearanceConfig;
  
  // Performance & Behavior
  responseStyle: 'detailed' | 'concise' | 'balanced';
  creativity: number;
  analytical: number;
  autonomy: number;
  
  // Advanced Features
  enableProactive: boolean;
  enableMemory: boolean;
  enableLearning: boolean;
  enableEmotional: boolean;
  enableMultimodal: boolean;
}

const VOICE_OPTIONS = [
  { value: 'default', label: 'Default Neutral' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'energetic', label: 'Energetic' }
];

const CAPABILITIES = [
  'Financial Analysis', 'Legal Research', 'Data Analysis', 'Report Generation',
  'Customer Service', 'Market Research', 'Project Management', 'Content Creation',
  'Code Review', 'Quality Assurance', 'Risk Assessment', 'Compliance Check',
  'Strategic Planning', 'Creative Writing', 'Technical Writing', 'Presentation Skills',
  'Negotiation', 'Sales', 'Marketing', 'Human Resources', 'Operations Management'
];

const TOOLS = [
  'web_search', 'calculator', 'data_analyzer', 'document_parser',
  'legal_database', 'compliance_checker', 'code_executor', 'file_manager',
  'email_client', 'calendar_manager', 'spreadsheet_editor', 'presentation_creator',
  'image_generator', 'audio_processor', 'video_analyzer', 'pdf_reader',
  'crm_integration', 'project_tracker', 'task_manager', 'meeting_scheduler',
  'translator', 'summarizer', 'plagiarism_checker', 'data_visualizer',
  'api_connector', 'database_query', 'workflow_automation', 'report_generator',
  'social_media_manager', 'content_optimizer', 'seo_analyzer', 'market_researcher',
  'financial_modeling', 'risk_assessment', 'compliance_monitor', 'audit_tool',
  'contract_analyzer', 'due_diligence', 'portfolio_manager', 'trading_simulator',
  'hr_management', 'recruitment_screening', 'performance_tracker', 'training_coordinator',
  'inventory_manager', 'supply_chain_optimizer', 'quality_control', 'logistics_planner',
  'customer_support', 'ticket_system', 'feedback_analyzer', 'satisfaction_surveyor',
  'research_assistant', 'literature_review', 'citation_manager', 'academic_writer',
  'technical_documenter', 'user_manual_creator', 'knowledge_base_manager', 'helpdesk_system',
  'voice_assistant', 'chatbot_builder', 'sentiment_analyzer', 'emotion_detector',
  'face_recognition', 'object_detection', 'text_to_speech', 'speech_to_text',
  'optical_character_recognition', 'handwriting_recognition', 'barcode_scanner', 'qr_code_generator',
  'blockchain_analyzer', 'cryptocurrency_tracker', 'smart_contract_auditor', 'nft_manager',
  'virtual_reality_creator', 'augmented_reality_builder', '3d_modeler', 'animation_generator',
  'music_composer', 'audio_editor', 'sound_effects_generator', 'podcast_producer',
  'video_editor', 'motion_graphics_creator', 'green_screen_processor', 'live_streamer',
  'game_developer', 'level_designer', 'character_animator', 'physics_simulator',
  'ai_trainer', 'model_optimizer', 'hyperparameter_tuner', 'neural_architect',
  'quantum_computing', 'cryptography_tool', 'security_scanner', 'penetration_tester',
  'network_monitor', 'system_optimizer', 'performance_profiler', 'debugging_assistant'
];

const EMPLOYEE_TEMPLATES = [
  {
    name: 'Executive Assistant',
    role: 'C-Level Executive Assistant',
    type: 'executive' as const,
    description: 'High-level executive support with advanced multitasking',
    capabilities: ['Project Management', 'Strategic Planning', 'Communication', 'Research'],
    icon: '👔'
  },
  {
    name: 'Financial Analyst',
    role: 'Senior Financial Analyst',
    type: 'specialist' as const,
    description: 'Expert financial analysis and reporting',
    capabilities: ['Financial Analysis', 'Risk Assessment', 'Market Research', 'Report Generation'],
    icon: '📊'
  },
  {
    name: 'Creative Director',
    role: 'Creative Content Director',
    type: 'creative' as const,
    description: 'Creative content generation and brand strategy',
    capabilities: ['Content Creation', 'Strategic Planning', 'Creative Writing', 'Presentation Skills'],
    icon: '🎨'
  },
  {
    name: 'Technical Lead',
    role: 'Senior Technical Lead',
    type: 'specialist' as const,
    description: 'Technical leadership and code review',
    capabilities: ['Code Review', 'Project Management', 'Technical Writing', 'Quality Assurance'],
    icon: '💻'
  },
  {
    name: 'Customer Success',
    role: 'Customer Success Manager',
    type: 'white_collar' as const,
    description: 'Customer relationship management and support',
    capabilities: ['Customer Service', 'Communication', 'Problem Solving', 'Relationship Management'],
    icon: '🤝'
  }
];

export default function CreateAIEmployeeAdvanced({ onEmployeeCreated }: { onEmployeeCreated?: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AdvancedAIEmployeeFormData>({
    name: '',
    role: '',
    type: 'white_collar',
    description: '',
    model: 'gpt-o1',
    temperature: 0.7,
    maxTokens: 4000,
    capabilities: [],
    tools: [],
    useMultiLLM: false,
    voiceConfig: {
      voice: 'default',
      pitch: 1.0,
      speed: 1.0,
      emotion: 'neutral',
      accent: 'american'
    },
    communicationStyle: 'professional',
    emotionalConfig: {
      empathy: 0.7,
      adaptability: 0.8,
      expressiveness: 0.6,
      patience: 0.9,
      humor: 0.3,
      professionalism: 0.8
    },
    memoryConfig: {
      shortTerm: true,
      longTerm: true,
      episodic: true,
      semantic: true,
      workingMemory: 8,
      retention: 0.8
    },
    learningRate: 0.5,
    adaptationSpeed: 0.6,
    appearanceConfig: {
      avatar: '',
      theme: 'auto',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      uiStyle: 'professional'
    },
    responseStyle: 'balanced',
    creativity: 0.6,
    analytical: 0.7,
    autonomy: 0.5,
    enableProactive: true,
    enableMemory: true,
    enableLearning: true,
    enableEmotional: true,
    enableMultimodal: false
  });

  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: keyof AdvancedAIEmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof AdvancedAIEmployeeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
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

  const handleTemplateSelect = (template: typeof EMPLOYEE_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      role: template.role,
      type: template.type,
      description: template.description,
      capabilities: template.capabilities
    }));
    setActiveTab("advanced");
  };

  const generateAvatar = async () => {
    try {
      const prompt = `Professional AI employee avatar for ${formData.name || 'AI Assistant'}, ${formData.role || 'Professional'}, ${formData.type}, corporate headshot style, realistic, professional, high quality`;
      
      const response = await fetch('/api/forge1/visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_avatar',
          data: { prompt, style: 'professional' }
        })
      });

      const result = await response.json();
      if (result.success && result.avatar) {
        handleNestedChange('appearanceConfig', 'avatar', result.avatar);
        toast({
          title: "Avatar Generated",
          description: "Professional avatar has been generated",
        });
      }
    } catch (error) {
      toast({
        title: "Avatar Generation Failed",
        description: "Could not generate avatar. Please try again.",
        variant: "destructive"
      });
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
    setCreationProgress(0);

    try {
      // Simulate creation progress
      const progressSteps = [
        { progress: 20, message: "Validating configuration..." },
        { progress: 40, message: "Setting up AI models..." },
        { progress: 60, message: "Configuring emotional intelligence..." },
        { progress: 80, message: "Initializing memory systems..." },
        { progress: 100, message: "Finalizing employee..." }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCreationProgress(step.progress);
      }

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
            description: formData.description,
            status: 'training',
            capabilities: formData.capabilities,
            config: {
              model: formData.model,
              temperature: formData.temperature,
              max_tokens: formData.maxTokens,
              tools: formData.tools,
              memory_config: formData.memoryConfig,
              voice_config: formData.voiceConfig,
              emotional_config: formData.emotionalConfig,
              appearance_config: formData.appearanceConfig,
              communication_style: formData.communicationStyle,
              response_style: formData.responseStyle,
              creativity: formData.creativity,
              analytical: formData.analytical,
              autonomy: formData.autonomy,
              enable_proactive: formData.enableProactive,
              enable_memory: formData.enableMemory,
              enable_learning: formData.enableLearning,
              enable_emotional: formData.enableEmotional,
              enable_multimodal: formData.enableMultimodal,
              learning_rate: formData.learningRate,
              adaptation_speed: formData.adaptationSpeed,
              multi_llm_config: formData.useMultiLLM ? formData.multiLLMConfig : undefined
            },
            performance: {
              accuracy: 0.8,
              speed: 0.7,
              reliability: 0.85,
              cost_efficiency: 0.9,
              human_comparison: 0.85
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Advanced AI Employee "${formData.name}" created successfully! Training in progress...`,
        });
        
        // Reset form
        setFormData({
          name: '',
          role: '',
          type: 'white_collar',
          description: '',
          model: 'gpt-o1',
          temperature: 0.7,
          maxTokens: 4000,
          capabilities: [],
          tools: [],
          useMultiLLM: false,
          voiceConfig: {
            voice: 'default',
            pitch: 1.0,
            speed: 1.0,
            emotion: 'neutral',
            accent: 'american'
          },
          communicationStyle: 'professional',
          emotionalConfig: {
            empathy: 0.7,
            adaptability: 0.8,
            expressiveness: 0.6,
            patience: 0.9,
            humor: 0.3,
            professionalism: 0.8
          },
          memoryConfig: {
            shortTerm: true,
            longTerm: true,
            episodic: true,
            semantic: true,
            workingMemory: 8,
            retention: 0.8
          },
          learningRate: 0.5,
          adaptationSpeed: 0.6,
          appearanceConfig: {
            avatar: '',
            theme: 'auto',
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            uiStyle: 'professional'
          },
          responseStyle: 'balanced',
          creativity: 0.6,
          analytical: 0.7,
          autonomy: 0.5,
          enableProactive: true,
          enableMemory: true,
          enableLearning: true,
          enableEmotional: true,
          enableMultimodal: false
        });
        setActiveTab("basic");

        // Call the callback to refresh the employee list
        if (onEmployeeCreated) {
          onEmployeeCreated();
        }
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
      setCreationProgress(0);
    }
  };

  const exportConfig = () => {
    const configStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'ai-employee'}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Exported",
      description: "Employee configuration has been exported",
    });
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setFormData(config);
        toast({
          title: "Configuration Imported",
          description: "Employee configuration has been imported",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid configuration file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>{formData.name || 'AI Employee'}</span>
                </CardTitle>
                <CardDescription>{formData.role || 'Professional AI Assistant'}</CardDescription>
              </div>
              <Button onClick={() => setPreviewMode(false)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Model:</strong> {formData.model}</div>
                  <div><strong>Type:</strong> {formData.type}</div>
                  <div><strong>Communication:</strong> {formData.communicationStyle}</div>
                  <div><strong>Response Style:</strong> {formData.responseStyle}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Emotional Intelligence</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Empathy</Label>
                  <Progress value={formData.emotionalConfig.empathy * 100} className="h-2 mt-1" />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(formData.emotionalConfig.empathy * 100)}%</div>
                </div>
                <div>
                  <Label>Adaptability</Label>
                  <Progress value={formData.emotionalConfig.adaptability * 100} className="h-2 mt-1" />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(formData.emotionalConfig.adaptability * 100)}%</div>
                </div>
                <div>
                  <Label>Professionalism</Label>
                  <Progress value={formData.emotionalConfig.professionalism * 100} className="h-2 mt-1" />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(formData.emotionalConfig.professionalism * 100)}%</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={createAIEmployee} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Creating... {creationProgress}%
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Create Employee
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <Settings className="w-4 h-4 mr-2" />
                Continue Editing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Advanced AI Employee</h1>
          <p className="text-muted-foreground">
            Design sophisticated AI employees with emotional intelligence and multi-LLM capabilities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Label htmlFor="import-config" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import Config
              </span>
            </Button>
          </Label>
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
          />
          <Button onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>Choose a template to get started quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {EMPLOYEE_TEMPLATES.map((template) => (
              <div
                key={template.name}
                className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{template.role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Employee Configuration</span>
            <Badge variant="outline">Advanced</Badge>
          </CardTitle>
          <CardDescription>
            Configure every aspect of your AI employee's personality, capabilities, and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
              <TabsTrigger value="emotional">Emotional</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employee-name">Employee Name *</Label>
                    <Input 
                      id="employee-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Senior Financial Analyst"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employee-role">Role *</Label>
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
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="employee-description">Description</Label>
                    <textarea
                      id="employee-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe this employee's purpose and responsibilities..."
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-model">Primary AI Model</Label>
                    <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-o1">GPT-O1 (Latest)</SelectItem>
                        <SelectItem value="gpt-o1-pro">GPT-O1 Pro</SelectItem>
                        <SelectItem value="gpt-o3">GPT-O3</SelectItem>
                        <SelectItem value="gpt-o3-pro">GPT-O3 Pro</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                        <SelectItem value="claude-opus-4">Claude Opus 4</SelectItem>
                        <SelectItem value="claude-opus-4.1">Claude Opus 4.1</SelectItem>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="glm-4.5">GLM-4.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="temperature">Creativity Level</Label>
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
                      <span>Balanced ({formData.temperature})</span>
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

                  <div>
                    <Label htmlFor="response-style">Response Style</Label>
                    <Select value={formData.responseStyle} onValueChange={(value) => handleInputChange('responseStyle', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                        <SelectItem value="concise">Concise & Direct</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Capabilities</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
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
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="use-multi-llm"
                      checked={formData.useMultiLLM}
                      onCheckedChange={(checked) => handleInputChange('useMultiLLM', checked as boolean)}
                    />
                    <Label htmlFor="use-multi-llm" className="text-base font-medium">
                      Enable Multi-LLM Collaboration
                    </Label>
                  </div>
                  
                  {formData.useMultiLLM && (
                    <div className="ml-6">
                      <MultiLLMConfigurator
                        config={formData.multiLLMConfig}
                        onChange={(config) => handleInputChange('multiLLMConfig', config)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Creativity</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[formData.creativity]}
                      onValueChange={(value) => handleInputChange('creativity', value[0])}
                      className="mt-4"
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {Math.round(formData.creativity * 100)}%
                    </div>
                  </div>
                  
                  <div>
                    <Label>Analytical Thinking</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[formData.analytical]}
                      onValueChange={(value) => handleInputChange('analytical', value[0])}
                      className="mt-4"
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {Math.round(formData.analytical * 100)}%
                    </div>
                  </div>
                  
                  <div>
                    <Label>Autonomy</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[formData.autonomy]}
                      onValueChange={(value) => handleInputChange('autonomy', value[0])}
                      className="mt-4"
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {Math.round(formData.autonomy * 100)}%
                    </div>
                  </div>
                </div>

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
            </TabsContent>

            <TabsContent value="emotional" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Emotional Intelligence Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label>Empathy</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.empathy]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'empathy', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.empathy * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Adaptability</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.adaptability]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'adaptability', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.adaptability * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Expressiveness</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.expressiveness]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'expressiveness', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.expressiveness * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Patience</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.patience]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'patience', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.patience * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Humor</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.humor]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'humor', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.humor * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Professionalism</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.emotionalConfig.professionalism]}
                        onValueChange={(value) => handleNestedChange('emotionalConfig', 'professionalism', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.emotionalConfig.professionalism * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="communication-style">Communication Style</Label>
                  <Select value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal & Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="technical">Technical & Detailed</SelectItem>
                      <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                      <SelectItem value="direct">Direct & Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="voice-type">Voice Type</Label>
                  <Select value={formData.voiceConfig.voice} onValueChange={(value) => handleNestedChange('voiceConfig', 'voice', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_OPTIONS.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Pitch</Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[formData.voiceConfig.pitch]}
                      onValueChange={(value) => handleNestedChange('voiceConfig', 'pitch', value[0])}
                      className="mt-4"
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {formData.voiceConfig.pitch}x
                    </div>
                  </div>
                  
                  <div>
                    <Label>Speed</Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[formData.voiceConfig.speed]}
                      onValueChange={(value) => handleNestedChange('voiceConfig', 'speed', value[0])}
                      className="mt-4"
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {formData.voiceConfig.speed}x
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="voice-emotion">Emotion</Label>
                    <Select value={formData.voiceConfig.emotion} onValueChange={(value) => handleNestedChange('voiceConfig', 'emotion', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                        <SelectItem value="excited">Excited</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="voice-accent">Accent</Label>
                    <Select value={formData.voiceConfig.accent} onValueChange={(value) => handleNestedChange('voiceConfig', 'accent', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="british">British</SelectItem>
                        <SelectItem value="australian">Australian</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Voice preview available after creation</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Avatar</Label>
                    <Button variant="outline" size="sm" onClick={generateAvatar}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Avatar
                    </Button>
                  </div>
                  
                  {formData.appearanceConfig.avatar ? (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.appearanceConfig.avatar} 
                        alt="Generated Avatar"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNestedChange('appearanceConfig', 'avatar', '')}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="ui-theme">UI Theme</Label>
                  <Select value={formData.appearanceConfig.theme} onValueChange={(value) => handleNestedChange('appearanceConfig', 'theme', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ui-style">UI Style</Label>
                  <Select value={formData.appearanceConfig.uiStyle} onValueChange={(value) => handleNestedChange('appearanceConfig', 'uiStyle', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={formData.appearanceConfig.primaryColor}
                        onChange={(e) => handleNestedChange('appearanceConfig', 'primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input 
                        value={formData.appearanceConfig.primaryColor}
                        onChange={(e) => handleNestedChange('appearanceConfig', 'primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={formData.appearanceConfig.secondaryColor}
                        onChange={(e) => handleNestedChange('appearanceConfig', 'secondaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input 
                        value={formData.appearanceConfig.secondaryColor}
                        onChange={(e) => handleNestedChange('appearanceConfig', 'secondaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Memory Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="short-term-memory"
                            checked={formData.memoryConfig.shortTerm}
                            onCheckedChange={(checked) => handleNestedChange('memoryConfig', 'shortTerm', checked as boolean)}
                          />
                          <Label htmlFor="short-term-memory" className="text-sm font-normal">
                            Short-term Memory
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="long-term-memory"
                            checked={formData.memoryConfig.longTerm}
                            onCheckedChange={(checked) => handleNestedChange('memoryConfig', 'longTerm', checked as boolean)}
                          />
                          <Label htmlFor="long-term-memory" className="text-sm font-normal">
                            Long-term Memory
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="episodic-memory"
                            checked={formData.memoryConfig.episodic}
                            onCheckedChange={(checked) => handleNestedChange('memoryConfig', 'episodic', checked as boolean)}
                          />
                          <Label htmlFor="episodic-memory" className="text-sm font-normal">
                            Episodic Memory
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="semantic-memory"
                            checked={formData.memoryConfig.semantic}
                            onCheckedChange={(checked) => handleNestedChange('memoryConfig', 'semantic', checked as boolean)}
                          />
                          <Label htmlFor="semantic-memory" className="text-sm font-normal">
                            Semantic Memory
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-4">
                        <div>
                          <Label>Working Memory (items)</Label>
                          <Slider
                            min={4}
                            max={16}
                            step={1}
                            value={[formData.memoryConfig.workingMemory]}
                            onValueChange={(value) => handleNestedChange('memoryConfig', 'workingMemory', value[0])}
                            className="mt-4"
                          />
                          <div className="text-center text-sm text-gray-500 mt-2">
                            {formData.memoryConfig.workingMemory} items
                          </div>
                        </div>
                        
                        <div>
                          <Label>Memory Retention</Label>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[formData.memoryConfig.retention]}
                            onValueChange={(value) => handleNestedChange('memoryConfig', 'retention', value[0])}
                            className="mt-4"
                          />
                          <div className="text-center text-sm text-gray-500 mt-2">
                            {Math.round(formData.memoryConfig.retention * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Learning & Adaptation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Learning Rate</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.learningRate]}
                        onValueChange={(value) => handleInputChange('learningRate', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.learningRate * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <Label>Adaptation Speed</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[formData.adaptationSpeed]}
                        onValueChange={(value) => handleInputChange('adaptationSpeed', value[0])}
                        className="mt-4"
                      />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(formData.adaptationSpeed * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Advanced Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-proactive"
                        checked={formData.enableProactive}
                        onCheckedChange={(checked) => handleInputChange('enableProactive', checked as boolean)}
                      />
                      <Label htmlFor="enable-proactive" className="text-sm font-normal">
                        Proactive Assistance
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-memory"
                        checked={formData.enableMemory}
                        onCheckedChange={(checked) => handleInputChange('enableMemory', checked as boolean)}
                      />
                      <Label htmlFor="enable-memory" className="text-sm font-normal">
                        Enhanced Memory
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-learning"
                        checked={formData.enableLearning}
                        onCheckedChange={(checked) => handleInputChange('enableLearning', checked as boolean)}
                      />
                      <Label htmlFor="enable-learning" className="text-sm font-normal">
                        Continuous Learning
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-emotional"
                        checked={formData.enableEmotional}
                        onCheckedChange={(checked) => handleInputChange('enableEmotional', checked as boolean)}
                      />
                      <Label htmlFor="enable-emotional" className="text-sm font-normal">
                        Emotional Intelligence
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-multimodal"
                        checked={formData.enableMultimodal}
                        onCheckedChange={(checked) => handleInputChange('enableMultimodal', checked as boolean)}
                      />
                      <Label htmlFor="enable-multimodal" className="text-sm font-normal">
                        Multimodal Processing
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Creation Progress */}
          {isCreating && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Creating AI Employee...</span>
                <span>{creationProgress}%</span>
              </div>
              <Progress value={creationProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <Button 
              onClick={createAIEmployee} 
              disabled={isCreating || !formData.name || !formData.role}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Create AI Employee
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}