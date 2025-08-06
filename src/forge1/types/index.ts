// Core Forge1 System Types

export interface SystemLayer {
  id: string;
  name: string;
  tech: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  progress: number;
  color: string;
  config: LayerConfig;
}

export interface LayerConfig {
  enabled: boolean;
  settings: Record<string, any>;
  dependencies: string[];
  resources: ResourceRequirements;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  gpu?: boolean;
  network: number;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'white_collar' | 'specialist' | 'generalist';
  role: string;
  capabilities: string[];
  status: 'training' | 'ready' | 'deployed' | 'inactive';
  performance: AgentPerformance;
  config: AgentConfig;
}

export interface AgentPerformance {
  accuracy: number;
  speed: number;
  reliability: number;
  cost_efficiency: number;
  human_comparison: number; // Percentage compared to human performance
}

export interface AgentConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  tools: string[];
  memory_config: MemoryConfig;
}

export interface MemoryConfig {
  short_term: boolean;
  long_term: boolean;
  context_window: number;
  retention_policy: string;
}

export interface SystemStatus {
  overall_health: 'excellent' | 'good' | 'fair' | 'poor';
  active_agents: number;
  total_agents: number;
  system_load: number;
  uptime: string;
  last_update: Date;
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  layer: string;
  timestamp: Date;
  resolved: boolean;
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  infrastructure: 'docker' | 'cloud' | 'on_prem' | 'custom';
  scaling: ScalingConfig;
  security: SecurityConfig;
}

export interface ScalingConfig {
  auto_scale: boolean;
  min_instances: number;
  max_instances: number;
  target_cpu_utilization: number;
  target_memory_utilization: number;
}

export interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  audit_logging: boolean;
  rate_limiting: boolean;
}

export interface Forge1Config {
  system_name: string;
  version: string;
  layers: SystemLayer[];
  agents: AIAgent[];
  deployment: DeploymentConfig;
  status: SystemStatus;
}