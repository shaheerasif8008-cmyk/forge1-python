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
import { 
  Brain, 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  Network, 
  Users, 
  Target,
  BarChart3,
  Lightbulb,
  FileText,
  Code,
  Calculator,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LLMModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "zhipu" | "mistral";
  model: string;
  role: "primary" | "secondary" | "specialist" | "critic" | "synthesizer";
  capabilities: string[];
  temperature: number;
  maxTokens: number;
  weight: number; // For voting/combination logic
  enabled: boolean;
}

interface MultiLLMConfig {
  collaborationMode: "parallel" | "sequential" | "voting" | "hierarchical";
  combinationStrategy: "merge" | "vote" | "synthesis" | "critique_then_improve";
  maxModels: number;
  models: LLMModel[];
}

const AVAILABLE_MODELS = {
  openai: [
    { value: "gpt-o1", label: "GPT-O1", description: "Latest reasoning model" },
    { value: "gpt-o1-pro", label: "GPT-O1 Pro", description: "Enhanced reasoning" },
    { value: "gpt-o3", label: "GPT-O3", description: "Advanced multimodal" },
    { value: "gpt-o3-pro", label: "GPT-O3 Pro", description: "Premium multimodal" },
    { value: "gpt-4o", label: "GPT-4O", description: "Optimized for speed" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "Fast and capable" }
  ],
  anthropic: [
    { value: "claude-opus-4", label: "Claude Opus 4", description: "Advanced reasoning" },
    { value: "claude-opus-4.1", label: "Claude Opus 4.1", description: "Latest version" },
    { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", description: "Balanced performance" }
  ],
  google: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Fast and capable" },
    { value: "gemini-pro", label: "Gemini Pro", description: "General purpose" },
    { value: "gemini-ultra", label: "Gemini Ultra", description: "Most capable" }
  ],
  zhipu: [
    { value: "glm-4.5", label: "GLM-4.5", description: "Latest Chinese model" },
    { value: "glm-4", label: "GLM-4", description: "Multimodal capable" }
  ],
  mistral: [
    { value: "mistral-large", label: "Mistral Large", description: "High performance" },
    { value: "mixtral-8x7b", label: "Mixtral 8x7B", description: "Mixture of experts" }
  ]
};

const MODEL_ROLES = [
  { value: "primary", label: "Primary", description: "Main model for task execution", icon: Brain },
  { value: "secondary", label: "Secondary", description: "Support model for verification", icon: Users },
  { value: "specialist", label: "Specialist", description: "Domain-specific expertise", icon: Target },
  { value: "critic", label: "Critic", description: "Reviews and improves outputs", icon: BarChart3 },
  { value: "synthesizer", label: "Synthesizer", description: "Combines multiple outputs", icon: Network }
];

const CAPABILITIES = [
  { value: "reasoning", label: "Logical Reasoning", icon: Brain },
  { value: "writing", label: "Creative Writing", icon: FileText },
  { value: "coding", label: "Code Generation", icon: Code },
  { value: "analysis", label: "Data Analysis", icon: BarChart3 },
  { value: "research", label: "Research", icon: Search },
  { value: "math", label: "Mathematics", icon: Calculator },
  { value: "synthesis", label: "Synthesis", icon: Lightbulb }
];

const COLLABORATION_MODES = [
  { value: "parallel", label: "Parallel Processing", description: "All models work simultaneously" },
  { value: "sequential", label: "Sequential Processing", description: "Models work in sequence" },
  { value: "voting", label: "Voting System", description: "Models vote on best output" },
  { value: "hierarchical", label: "Hierarchical", description: "Primary model delegates tasks" }
];

const COMBINATION_STRATEGIES = [
  { value: "merge", label: "Simple Merge", description: "Combine all responses" },
  { value: "vote", label: "Majority Vote", description: "Select most common response" },
  { value: "synthesis", label: "AI Synthesis", description: "Use AI to combine responses" },
  { value: "critique_then_improve", label: "Critique & Improve", description: "Models critique then improve" }
];

interface MultiLLMConfiguratorProps {
  config?: MultiLLMConfig;
  onChange: (config: MultiLLMConfig) => void;
}

export { MultiLLMConfig };
export default function MultiLLMConfigurator({ config, onChange }: MultiLLMConfiguratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("models");
  
  const defaultConfig: MultiLLMConfig = {
    collaborationMode: "parallel",
    combinationStrategy: "synthesis",
    maxModels: 5,
    models: [
      {
        id: "1",
        name: "Primary Model",
        provider: "openai",
        model: "gpt-o1",
        role: "primary",
        capabilities: ["reasoning", "analysis"],
        temperature: 0.1,
        maxTokens: 4000,
        weight: 1.0,
        enabled: true
      }
    ]
  };

  const currentConfig = config || defaultConfig;

  const updateConfig = (updates: Partial<MultiLLMConfig>) => {
    onChange({ ...currentConfig, ...updates });
  };

  const addModel = () => {
    if (currentConfig.models.length >= currentConfig.maxModels) {
      toast({
        title: "Maximum Models Reached",
        description: `You can only add up to ${currentConfig.maxModels} models`,
        variant: "destructive"
      });
      return;
    }

    const newModel: LLMModel = {
      id: Date.now().toString(),
      name: `Model ${currentConfig.models.length + 1}`,
      provider: "openai",
      model: "gpt-4o",
      role: "secondary",
      capabilities: ["analysis"],
      temperature: 0.3,
      maxTokens: 2000,
      weight: 0.8,
      enabled: true
    };

    updateConfig({
      models: [...currentConfig.models, newModel]
    });

    toast({
      title: "Model Added",
      description: "New model has been added to the collaboration"
    });
  };

  const removeModel = (modelId: string) => {
    if (currentConfig.models.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one model must remain in the collaboration",
        variant: "destructive"
      });
      return;
    }

    updateConfig({
      models: currentConfig.models.filter(m => m.id !== modelId)
    });

    toast({
      title: "Model Removed",
      description: "Model has been removed from the collaboration"
    });
  };

  const updateModel = (modelId: string, updates: Partial<LLMModel>) => {
    updateConfig({
      models: currentConfig.models.map(m => 
        m.id === modelId ? { ...m, ...updates } : m
      )
    });
  };

  const getProviderModels = (provider: string) => {
    return AVAILABLE_MODELS[provider as keyof typeof AVAILABLE_MODELS] || [];
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = MODEL_ROLES.find(r => r.value === role);
    return roleConfig ? roleConfig.icon : Brain;
  };

  const getCapabilityIcon = (capability: string) => {
    const capConfig = CAPABILITIES.find(c => c.value === capability);
    return capConfig ? capConfig.icon : Target;
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Multi-LLM Collaboration</span>
            <Badge variant="outline">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Configure multiple AI models to collaborate on tasks for enhanced performance and reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">AI Models</h3>
                  <p className="text-sm text-gray-500">
                    {currentConfig.models.length} of {currentConfig.maxModels} models configured
                  </p>
                </div>
                <Button onClick={addModel} disabled={currentConfig.models.length >= currentConfig.maxModels}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Model
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {currentConfig.models.map((model) => {
                  const RoleIcon = getRoleIcon(model.role);
                  return (
                    <Card key={model.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RoleIcon className="w-4 h-4" />
                              <Input
                                value={model.name}
                                onChange={(e) => updateModel(model.id, { name: e.target.value })}
                                className="w-48"
                                placeholder="Model name"
                              />
                              <Badge variant="outline">{model.role}</Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Select
                                value={model.provider}
                                onValueChange={(value) => updateModel(model.id, { provider: value as any, model: "" })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(AVAILABLE_MODELS).map((provider) => (
                                    <SelectItem key={provider} value={provider}>
                                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={model.model}
                                onValueChange={(value) => updateModel(model.id, { model: value })}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getProviderModels(model.provider).map((modelOption) => (
                                    <SelectItem key={modelOption.value} value={modelOption.value}>
                                      {modelOption.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={model.enabled}
                              onCheckedChange={(checked) => updateModel(model.id, { enabled: checked as boolean })}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModel(model.id)}
                              disabled={currentConfig.models.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`role-${model.id}`}>Role</Label>
                            <Select
                              value={model.role}
                              onValueChange={(value) => updateModel(model.id, { role: value as any })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MODEL_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center space-x-2">
                                      <role.icon className="w-4 h-4" />
                                      <span>{role.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`weight-${model.id}`}>Weight</Label>
                            <Slider
                              id={`weight-${model.id}`}
                              min={0.1}
                              max={2}
                              step={0.1}
                              value={[model.weight]}
                              onValueChange={(value) => updateModel(model.id, { weight: value[0] })}
                              className="mt-4"
                            />
                            <div className="text-xs text-gray-500 mt-1">{model.weight}x</div>
                          </div>
                          <div>
                            <Label htmlFor={`temp-${model.id}`}>Temperature</Label>
                            <Slider
                              id={`temp-${model.id}`}
                              min={0}
                              max={1}
                              step={0.1}
                              value={[model.temperature]}
                              onValueChange={(value) => updateModel(model.id, { temperature: value[0] })}
                              className="mt-4"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tokens-${model.id}`}>Max Tokens</Label>
                            <Input
                              id={`tokens-${model.id}`}
                              type="number"
                              value={model.maxTokens}
                              onChange={(e) => updateModel(model.id, { maxTokens: parseInt(e.target.value) })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Capabilities</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {CAPABILITIES.map((capability) => (
                              <div key={capability.value} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`cap-${model.id}-${capability.value}`}
                                  checked={model.capabilities.includes(capability.value)}
                                  onCheckedChange={(checked) => {
                                    const currentCaps = model.capabilities;
                                    const newCaps = checked 
                                      ? [...currentCaps, capability.value]
                                      : currentCaps.filter(c => c !== capability.value);
                                    updateModel(model.id, { capabilities: newCaps });
                                  }}
                                />
                                <Label
                                  htmlFor={`cap-${model.id}-${capability.value}`}
                                  className="text-xs flex items-center space-x-1"
                                >
                                  <capability.icon className="w-3 h-3" />
                                  <span>{capability.label}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collaboration Mode</CardTitle>
                    <CardDescription>How models work together</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {COLLABORATION_MODES.map((mode) => (
                      <div
                        key={mode.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentConfig.collaborationMode === mode.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateConfig({ collaborationMode: mode.value as any })}
                      >
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-sm text-gray-600">{mode.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Combination Strategy</CardTitle>
                    <CardDescription>How to combine model outputs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {COMBINATION_STRATEGIES.map((strategy) => (
                      <div
                        key={strategy.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentConfig.combinationStrategy === strategy.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateConfig({ combinationStrategy: strategy.value as any })}
                      >
                        <div className="font-medium">{strategy.label}</div>
                        <div className="text-sm text-gray-600">{strategy.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Settings</CardTitle>
                  <CardDescription>Fine-tune collaboration parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="max-models">Maximum Models</Label>
                    <Slider
                      id="max-models"
                      min={2}
                      max={10}
                      step={1}
                      value={[currentConfig.maxModels]}
                      onValueChange={(value) => updateConfig({ maxModels: value[0] })}
                      className="mt-4"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Up to {currentConfig.maxModels} models can collaborate
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Performance Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className="text-yellow-600">
                            {currentConfig.models.length > 3 ? 'Slower' : 'Fast'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span className="text-green-600">
                            {currentConfig.models.length > 1 ? 'Enhanced' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost:</span>
                          <span className="text-red-600">
                            {currentConfig.models.length > 2 ? 'Higher' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Collaboration Benefits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${currentConfig.models.length > 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>Multiple perspectives</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${currentConfig.models.length > 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>Error reduction</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${currentConfig.collaborationMode === 'voting' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span>Consensus building</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}