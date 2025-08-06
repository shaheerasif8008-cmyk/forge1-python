"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  Brain,
  Cpu,
  Network,
  Activity
} from "lucide-react";

interface LoadingIndicatorProps {
  taskId?: string;
  title: string;
  description?: string;
  progress?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  steps?: Array<{ name: string; completed: boolean; description?: string }>;
  showDetails?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

interface TaskProgress {
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  estimatedTimeRemaining?: number;
  error?: string;
}

export default function LoadingIndicator({
  taskId,
  title,
  description,
  progress = 0,
  status = 'pending',
  steps,
  showDetails = false,
  onCancel,
  onRetry,
  className = ""
}: LoadingIndicatorProps) {
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({
    progress,
    status,
    currentStep: steps?.find(s => !s.completed)?.name
  });

  useEffect(() => {
    setTaskProgress({
      progress,
      status,
      currentStep: steps?.find(s => !s.completed)?.name
    });
  }, [progress, status, steps]);

  // Simulate progress updates for demo purposes
  useEffect(() => {
    if (status === 'running' && progress === 0) {
      const interval = setInterval(() => {
        setTaskProgress(prev => {
          if (prev.status !== 'running') return prev;
          
          const newProgress = Math.min(95, prev.progress + Math.random() * 10);
          const currentStepIndex = steps?.findIndex(s => !s.completed) ?? -1;
          const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex].name : undefined;
          
          return {
            ...prev,
            progress: newProgress,
            currentStep
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, progress, steps]);

  const getStatusIcon = () => {
    switch (taskProgress.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (taskProgress.status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = () => {
    switch (taskProgress.status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getActivityIcon = () => {
    const icons = [Zap, Brain, Cpu, Network, Activity];
    const Icon = icons[Math.floor(Math.random() * icons.length)];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{title}</h3>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={getStatusColor()}
              >
                {taskProgress.status.charAt(0).toUpperCase() + taskProgress.status.slice(1)}
              </Badge>
              {taskId && (
                <span className="text-xs text-gray-500 font-mono">
                  ID: {taskId.slice(0, 8)}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(taskProgress.progress)}%</span>
            </div>
            <Progress 
              value={taskProgress.progress} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {taskProgress.currentStep && `Current: ${taskProgress.currentStep}`}
              </span>
              <span>
                {taskProgress.status === 'running' && 'Processing...'}
                {taskProgress.status === 'completed' && 'Completed'}
                {taskProgress.status === 'failed' && 'Failed'}
                {taskProgress.status === 'cancelled' && 'Cancelled'}
              </span>
            </div>
          </div>

          {/* Steps */}
          {showDetails && steps && steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Steps</h4>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {step.completed && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.name}</div>
                      {step.description && (
                        <div className="text-xs text-gray-500">{step.description}</div>
                      )}
                    </div>
                    {step.completed && getActivityIcon()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Animation */}
          {taskProgress.status === 'running' && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span>Processing...</span>
            </div>
          )}

          {/* Error Message */}
          {taskProgress.status === 'failed' && taskProgress.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{taskProgress.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {(onCancel || onRetry) && (
            <div className="flex justify-end space-x-2">
              {taskProgress.status === 'running' && onCancel && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              {taskProgress.status === 'failed' && onRetry && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRetry}
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized loading indicators for different task types
export function AgentTrainingIndicator({ agentName, ...props }: Omit<LoadingIndicatorProps, 'title'> & { agentName: string }) {
  return (
    <LoadingIndicator
      title={`Training ${agentName}`}
      description="AI agent is learning and adapting to new data..."
      steps={[
        { name: "Data Processing", completed: false, description: "Preparing training dataset" },
        { name: "Model Initialization", completed: false, description: "Setting up neural networks" },
        { name: "Training Loop", completed: false, description: "Optimizing model parameters" },
        { name: "Validation", completed: false, description: "Testing model performance" },
        { name: "Finalization", completed: false, description: "Saving trained model" }
      ]}
      showDetails={true}
      {...props}
    />
  );
}

export function AgentDeploymentIndicator({ agentName, ...props }: Omit<LoadingIndicatorProps, 'title'> & { agentName: string }) {
  return (
    <LoadingIndicator
      title={`Deploying ${agentName}`}
      description="Deploying AI agent to production environment..."
      steps={[
        { name: "Environment Setup", completed: false, description: "Configuring deployment environment" },
        { name: "Model Loading", completed: false, description: "Loading AI model into memory" },
        { name: "API Configuration", completed: false, description: "Setting up API endpoints" },
        { name: "Health Check", completed: false, description: "Verifying deployment health" },
        { name: "Go Live", completed: false, description: "Making agent available" }
      ]}
      showDetails={true}
      {...props}
    />
  );
}

export function MultiLLMExecutionIndicator({ ...props }: Omit<LoadingIndicatorProps, 'title'>) {
  return (
    <LoadingIndicator
      title="Multi-LLM Execution"
      description="Multiple AI models are collaborating on your request..."
      steps={[
        { name: "Model Selection", completed: false, description: "Selecting optimal AI models" },
        { name: "Parallel Processing", completed: false, description: "Models processing simultaneously" },
        { name: "Result Synthesis", completed: false, description: "Combining model outputs" },
        { name: "Quality Check", completed: false, description: "Validating final response" }
      ]}
      showDetails={true}
      {...props}
    />
  );
}

export function ChatProcessingIndicator({ ...props }: Omit<LoadingIndicatorProps, 'title'>) {
  return (
    <LoadingIndicator
      title="Processing Message"
      description="AI agent is generating a response..."
      steps={[
        { name: "Context Analysis", completed: false, description: "Analyzing conversation context" },
        { name: "Intent Understanding", completed: false, description: "Understanding user intent" },
        { name: "Response Generation", completed: false, description: "Generating appropriate response" },
        { name: "Emotional Analysis", completed: false, description: "Applying emotional intelligence" }
      ]}
      showDetails={true}
      {...props}
    />
  );
}