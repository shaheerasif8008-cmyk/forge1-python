"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  TreePine, 
  Map, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Target,
  Lightbulb,
  Zap
} from "lucide-react";
import { WorldModelingService, WorldModel, PlanningSession, PlanningStep } from "../service";

const worldModelingService = new WorldModelingService();

export default function WorldModelingDashboard() {
  const [worldModels, setWorldModels] = useState<WorldModel[]>([]);
  const [planningSessions, setPlanningSessions] = useState<PlanningSession[]>([]);
  const [selectedModel, setSelectedModel] = useState<WorldModel | null>(null);
  const [selectedSession, setSelectedSession] = useState<PlanningSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Form states
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelConstraints, setModelConstraints] = useState("");
  const [modelObjectives, setModelObjectives] = useState("");
  const [planningObjective, setPlanningObjective] = useState("");
  const [planningMethod, setPlanningMethod] = useState<"react" | "tree_of_thought" | "open_planner">("open_planner");

  useEffect(() => {
    loadWorldModels();
    loadPlanningSessions();
  }, []);

  const loadWorldModels = async () => {
    // In production, load from API
    const mockModels: WorldModel[] = [
      {
        id: "wm_1",
        name: "Business Process Automation",
        description: "Model for automating business workflows",
        state: { processes: 5, automated: 2, manual: 3 },
        constraints: ["Must maintain data integrity", "Cannot exceed budget limits"],
        objectives: ["Increase automation by 80%", "Reduce processing time by 50%"],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setWorldModels(mockModels);
  };

  const loadPlanningSessions = async () => {
    // In production, load from API
    const mockSessions: PlanningSession[] = [
      {
        id: "plan_1",
        world_model_id: "wm_1",
        objective: "Automate invoice processing",
        steps: [],
        status: "completed",
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    setPlanningSessions(mockSessions);
  };

  const handleCreateWorldModel = async () => {
    if (!modelName || !modelDescription) return;

    setIsCreating(true);
    try {
      const constraints = modelConstraints.split('\n').filter(c => c.trim());
      const objectives = modelObjectives.split('\n').filter(o => o.trim());
      
      const newModel = await worldModelingService.createWorldModel({
        name: modelName,
        description: modelDescription,
        initialState: { created: new Date().toISOString() },
        constraints,
        objectives
      });

      setWorldModels(prev => [...prev, newModel]);
      setModelName("");
      setModelDescription("");
      setModelConstraints("");
      setModelObjectives("");
    } catch (error) {
      console.error('Failed to create world model:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedModel || !planningObjective) return;

    setIsPlanning(true);
    try {
      const newSession = await worldModelingService.generatePlan(
        selectedModel,
        planningObjective,
        planningMethod
      );

      setPlanningSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
      setPlanningObjective("");
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!selectedSession) return;

    setIsExecuting(true);
    try {
      await worldModelingService.executePlan(selectedSession);
      setPlanningSessions(prev => 
        prev.map(session => 
          session.id === selectedSession.id ? selectedSession : session
        )
      );
    } catch (error) {
      console.error('Failed to execute plan:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'executing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'react':
        return <Brain className="w-4 h-4" />;
      case 'tree_of_thought':
        return <TreePine className="w-4 h-4" />;
      case 'open_planner':
        return <Map className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">World Modeling & Planning</h2>
          <p className="text-muted-foreground">
            Advanced AI planning with OpenPlanner, ReAct, and Tree of Thought
          </p>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">World Models</TabsTrigger>
          <TabsTrigger value="planning">Planning Sessions</TabsTrigger>
          <TabsTrigger value="execution">Plan Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create World Model */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Create World Model</span>
                </CardTitle>
                <CardDescription>
                  Define a world model with constraints and objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <Label htmlFor="modelDescription">Description</Label>
                  <Textarea
                    id="modelDescription"
                    value={modelDescription}
                    onChange={(e) => setModelDescription(e.target.value)}
                    placeholder="Describe the world model"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="modelConstraints">Constraints (one per line)</Label>
                  <Textarea
                    id="modelConstraints"
                    value={modelConstraints}
                    onChange={(e) => setModelConstraints(e.target.value)}
                    placeholder="Enter constraints, one per line"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="modelObjectives">Objectives (one per line)</Label>
                  <Textarea
                    id="modelObjectives"
                    value={modelObjectives}
                    onChange={(e) => setModelObjectives(e.target.value)}
                    placeholder="Enter objectives, one per line"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateWorldModel} 
                  disabled={isCreating || !modelName || !modelDescription}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create World Model"}
                </Button>
              </CardContent>
            </Card>

            {/* World Models List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing World Models</CardTitle>
                <CardDescription>
                  Select a world model to work with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {worldModels.map((model) => (
                    <div
                      key={model.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedModel?.id === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{model.name}</h4>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </div>
                        <Badge variant="outline">
                          {model.constraints.length} constraints
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Generate Plan</span>
                </CardTitle>
                <CardDescription>
                  Create a plan using advanced AI planning methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="selectedModel">Selected World Model</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {selectedModel ? selectedModel.name : "No model selected"}
                  </div>
                </div>
                <div>
                  <Label htmlFor="planningObjective">Planning Objective</Label>
                  <Textarea
                    id="planningObjective"
                    value={planningObjective}
                    onChange={(e) => setPlanningObjective(e.target.value)}
                    placeholder="What do you want to achieve?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="planningMethod">Planning Method</Label>
                  <Select value={planningMethod} onValueChange={(value: any) => setPlanningMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4" />
                          <span>ReAct (Reasoning and Acting)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tree_of_thought">
                        <div className="flex items-center space-x-2">
                          <TreePine className="w-4 h-4" />
                          <span>Tree of Thought</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="open_planner">
                        <div className="flex items-center space-x-2">
                          <Map className="w-4 h-4" />
                          <span>OpenPlanner</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGeneratePlan} 
                  disabled={isPlanning || !selectedModel || !planningObjective}
                  className="w-full"
                >
                  {isPlanning ? "Generating..." : "Generate Plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Planning Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Planning Sessions</CardTitle>
                <CardDescription>
                  View and manage your planning sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {planningSessions.map((session) => (
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
                          <span className="font-medium">{session.objective}</span>
                        </div>
                        <Badge variant="outline">{session.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.steps.length} steps • {session.created_at.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Execution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Execute Plan</span>
                </CardTitle>
                <CardDescription>
                  Execute the selected planning session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Session</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedSession ? (
                      <div>
                        <div className="font-medium">{selectedSession.objective}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedSession.steps.length} steps • Status: {selectedSession.status}
                        </div>
                      </div>
                    ) : (
                      "No session selected"
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleExecutePlan} 
                  disabled={isExecuting || !selectedSession || selectedSession.status === 'completed'}
                  className="w-full"
                >
                  {isExecuting ? "Executing..." : "Execute Plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Execution Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Progress</CardTitle>
                <CardDescription>
                  Track the execution of your plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedSession.steps.filter(s => s.observation).length}/{selectedSession.steps.length}
                      </span>
                    </div>
                    <Progress 
                      value={(selectedSession.steps.filter(s => s.observation).length / selectedSession.steps.length) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedSession.steps.map((step, index) => (
                        <div key={step.id} className="p-2 border rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {getMethodIcon(step.type)}
                              <span className="text-sm font-medium">Step {index + 1}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {Math.round(step.confidence * 100)}%
                              </Badge>
                              {step.observation && <CheckCircle className="w-3 h-3 text-green-500" />}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">{step.thought}</div>
                          <div className="text-xs text-blue-600 mt-1">{step.action}</div>
                          {step.observation && (
                            <div className="text-xs text-green-600 mt-1">{step.observation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a planning session to view execution progress
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