"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Eye, 
  Database, 
  Shield, 
  Cloud, 
  Heart, 
  Cube, 
  Cpu,
  Network,
  Activity,
  Zap,
  Target,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Play,
  Settings,
  Workflow,
  MapPin,
  Layers,
  Plus,
  RefreshCw
} from "lucide-react";

// Import all the dashboards
import WorldModelingDashboard from "@/forge1/world-modeling/components/WorldModelingDashboard";
import VisionDashboard from "@/forge1/vision/components/VisionDashboard";
import APIWorkersDashboard from "@/forge1/api-workers/components/APIWorkersDashboard";
import ComplianceDashboard from "@/forge1/compliance/components/ComplianceDashboard";
import SaaSAgentsDashboard from "@/forge1/saas-agents/components/SaaSAgentsDashboard";
import EmotionalAIDashboard from "@/forge1/emotional/components/EmotionalAIDashboard";
import SpatialAgentsDashboard from "@/forge1/spatial/components/SpatialAgentsDashboard";
import CentralControlDashboard from "@/forge1/central-control/components/CentralControlDashboard";

export default function Home() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading system status
    setTimeout(() => {
      setSystemStatus({
        totalModules: 7,
        activeModules: 7,
        averageResponseTime: 195,
        systemUptime: 99.2,
        errorRate: 2.1,
        throughput: 485,
        resourceUtilization: {
          cpu: 42,
          memory: 58,
          storage: 31,
          network: 23
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const features = [
    {
      id: "world_modeling",
      name: "World Modeling & Planning",
      description: "OpenPlanner + ReAct + Tree of Thought",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: "active"
    },
    {
      id: "vision",
      name: "Vision Beyond Images",
      description: "GPT-4o + GroundingDINO + CLIP",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: "active"
    },
    {
      id: "api_workers",
      name: "Full API Worker Agents",
      description: "N8N + Supabase + auto gen+ LangGraph",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50",
      status: "active"
    },
    {
      id: "compliance",
      name: "Compliance/Legal Layer",
      description: "Agent + LLMR (legal/ethics checker AI)",
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: "active"
    },
    {
      id: "saas_agents",
      name: "SaaS-as-Agent Architecture",
      description: "Each SaaS app is an AI employee instance",
      icon: Cloud,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      status: "active"
    },
    {
      id: "emotional",
      name: "Emotional AI Layer",
      description: "CallMind or trained LLM emotion detector",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      status: "active"
    },
    {
      id: "spatial",
      name: "Spatial Agents / XR",
      description: "For future VR/metaverse interfaces",
      icon: Cube,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Forge 1</h1>
                <p className="text-sm text-muted-foreground">Enterprise AI Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Advanced AI Employee Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Forge 1 integrates 7 cutting-edge AI technologies into a unified platform, 
            enabling enterprises to deploy intelligent AI employees with unprecedented capabilities.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg">
              <Play className="w-4 h-4 mr-2" />
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>

        {/* System Status Overview */}
        {!isLoading && systemStatus && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.activeModules}/{systemStatus.totalModules}</div>
                  <p className="text-xs text-muted-foreground">All modules operational</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.averageResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground">Overall system uptime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus.throughput}/s</div>
                  <p className="text-xs text-muted-foreground">Requests per second</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">AI Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {feature.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Control Center</h3>
          <Tabs defaultValue="central" className="space-y-6">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="central">Central AI</TabsTrigger>
              <TabsTrigger value="world">World Model</TabsTrigger>
              <TabsTrigger value="vision">Vision</TabsTrigger>
              <TabsTrigger value="api">API Workers</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="saas">SaaS Agents</TabsTrigger>
              <TabsTrigger value="emotional">Emotional AI</TabsTrigger>
              <TabsTrigger value="spatial">Spatial XR</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="central">
              <CentralControlDashboard />
            </TabsContent>

            <TabsContent value="world">
              <WorldModelingDashboard />
            </TabsContent>

            <TabsContent value="vision">
              <VisionDashboard />
            </TabsContent>

            <TabsContent value="api">
              <APIWorkersDashboard />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceDashboard />
            </TabsContent>

            <TabsContent value="saas">
              <SaaSAgentsDashboard />
            </TabsContent>

            <TabsContent value="emotional">
              <EmotionalAIDashboard />
            </TabsContent>

            <TabsContent value="spatial">
              <SpatialAgentsDashboard />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Advanced Analytics</span>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analytics and insights across all AI modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Advanced Analytics Dashboard</h4>
                      <p className="text-muted-foreground mb-4">
                        Cross-module analytics, performance metrics, and business insights
                      </p>
                      <Button>Coming Soon</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enterprise Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Enterprise-Ready Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Multi-Tenant Architecture</span>
                </CardTitle>
                <CardDescription>
                  Secure isolation between different organizations and users
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Enterprise Security</span>
                </CardTitle>
                <CardDescription>
                  SOC 2 compliant, end-to-end encryption, audit trails
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Workflow className="w-5 h-5" />
                  <span>Scalable Infrastructure</span>
                </CardTitle>
                <CardDescription>
                  Auto-scaling, load balancing, global deployment
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the enterprises already using Forge 1 to deploy intelligent AI employees 
            and streamline their operations with cutting-edge automation.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              <Users className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="font-semibold">Forge 1</div>
                <div className="text-sm text-muted-foreground">Enterprise AI Platform</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Forge 1. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}