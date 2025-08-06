"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Activity, 
  Settings, 
  Play,
  Lock,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Database,
  Network,
  Eye,
  RefreshCw,
  Upload,
  Scan
} from "lucide-react";

interface SecurityStatus {
  authentication: string;
  authorization: string;
  encryption: string;
  audit_logging: string;
  rate_limiting: string;
  firewall: string;
  intrusion_detection: string;
  vulnerability_scanning: string;
}

interface Policy {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  last_updated: string;
  compliance_score: number;
}

interface Pipeline {
  id: string;
  name: string;
  status: string;
  stages: string[];
  last_run: string;
  duration: number;
  success_rate: number;
  auto_deploy: boolean;
}

interface Threat {
  id: string;
  type: string;
  severity: string;
  status: string;
  detected_at: string;
  source_ip: string;
  description: string;
  action_taken: string;
  resolved: boolean;
}

export default function SecurityCICDLayer() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scanType, setScanType] = useState('comprehensive');
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    fetchSecurityStatus();
    fetchPolicies();
    fetchPipelines();
    fetchThreats();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/forge1/security?action=status');
      const data = await response.json();
      setSecurityStatus(data.security_status);
    } catch (error) {
      console.error('Error fetching security status:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/forge1/security?action=policies');
      const data = await response.json();
      setPolicies(data.policies);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/forge1/security?action=cicd');
      const data = await response.json();
      setPipelines(data.pipelines);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  const fetchThreats = async () => {
    try {
      const response = await fetch('/api/forge1/security?action=threats');
      const data = await response.json();
      setThreats(data.threats);
    } catch (error) {
      console.error('Error fetching threats:', error);
    }
  };

  const handleSecurityScan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'security_scan',
          data: { scan_type: scanType }
        })
      });
      
      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      console.error('Error running security scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forge1/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_pipeline',
          data: { pipeline_id }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchPipelines();
      }
    } catch (error) {
      console.error('Error running pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-500';
      case 'active': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      case 'mitigated': return 'bg-yellow-500';
      case 'monitoring': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-teal-500 bg-opacity-10">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Security & CI/CD Layer</span>
                  <Badge variant="outline">Docker + GitHub Actions + auth + pre-commit</Badge>
                </CardTitle>
                <CardDescription>
                  Real dev pipeline
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Active</Badge>
              <Button
                onClick={() => {
                  fetchSecurityStatus();
                  fetchPolicies();
                  fetchPipelines();
                  fetchThreats();
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
              <div className="text-2xl font-bold text-teal-600">
                {policies.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Policies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pipelines.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Pipelines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {threats.filter(t => !t.resolved).length}
              </div>
              <div className="text-sm text-slate-600">Active Threats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {threats.filter(t => t.resolved).length}
              </div>
              <div className="text-sm text-slate-600">Resolved Threats</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD Pipelines</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="scanning">Security Scanning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Status</span>
              </CardTitle>
              <CardDescription>
                Current security posture and system status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {securityStatus && Object.entries(securityStatus).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(value)}`}></div>
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Security Policies</span>
              </CardTitle>
              <CardDescription>
                Manage and monitor security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {policies.map((policy) => (
                  <Card key={policy.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(policy.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{policy.name}</h4>
                              <Badge variant="outline">{policy.type}</Badge>
                              <Badge 
                                variant={policy.status === 'active' ? 'default' : 'secondary'}
                              >
                                {policy.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{policy.description}</p>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Last updated: {new Date(policy.last_updated).toLocaleDateString()}</span>
                              <span>Compliance: {(policy.compliance_score * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Compliance</span>
                              <span>{(policy.compliance_score * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={policy.compliance_score * 100} className="h-1" />
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cicd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>CI/CD Pipelines</span>
              </CardTitle>
              <CardDescription>
                Continuous integration and deployment pipelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pipelines.map((pipeline) => (
                  <Card key={pipeline.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(pipeline.status)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{pipeline.name}</h4>
                              <Badge 
                                variant={pipeline.status === 'active' ? 'default' : 'secondary'}
                              >
                                {pipeline.status}
                              </Badge>
                              {pipeline.auto_deploy && (
                                <Badge variant="outline" className="text-green-600">
                                  Auto-deploy
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Stages: {pipeline.stages.length}</span>
                              <span>Duration: {Math.floor(pipeline.duration / 60)}m</span>
                              <span>Success rate: {(pipeline.success_rate * 100).toFixed(1)}%</span>
                              <span>Last run: {new Date(pipeline.last_run).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Success</span>
                              <span>{(pipeline.success_rate * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={pipeline.success_rate * 100} className="h-1" />
                          </div>
                          <Button
                            onClick={() => handleRunPipeline(pipeline.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Run
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Security Threats</span>
              </CardTitle>
              <CardDescription>
                Detected and managed security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {threats.map((threat) => (
                  <Card key={threat.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(threat.severity)}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium capitalize">{threat.type.replace('_', ' ')}</h4>
                              <Badge 
                                variant={
                                  threat.severity === 'critical' ? 'destructive' :
                                  threat.severity === 'high' ? 'destructive' :
                                  threat.severity === 'medium' ? 'outline' : 'secondary'
                                }
                              >
                                {threat.severity}
                              </Badge>
                              <Badge 
                                variant={threat.resolved ? 'default' : 'secondary'}
                              >
                                {threat.resolved ? 'Resolved' : threat.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{threat.description}</p>
                            <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                              <span>Source: {threat.source_ip}</span>
                              <span>Action: {threat.action_taken.replace('_', ' ')}</span>
                              <span>Detected: {new Date(threat.detected_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {threat.resolved ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scan className="w-5 h-5" />
                <span>Security Scanning</span>
              </CardTitle>
              <CardDescription>
                Run security scans and vulnerability assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scan Type</label>
                  <Select value={scanType} onValueChange={setScanType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="vulnerability">Vulnerability Scan</SelectItem>
                      <SelectItem value="compliance">Compliance Check</SelectItem>
                      <SelectItem value="malware">Malware Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Scope</label>
                  <Select defaultValue="full_system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_system">Full System</SelectItem>
                      <SelectItem value="web_services">Web Services</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleSecurityScan}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Scanning...' : 'Run Security Scan'}
              </Button>
              
              {scanResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scan Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {scanResult.findings.critical}
                          </div>
                          <div className="text-xs text-slate-600">Critical</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {scanResult.findings.high}
                          </div>
                          <div className="text-xs text-slate-600">High</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {scanResult.findings.medium}
                          </div>
                          <div className="text-xs text-slate-600">Medium</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {scanResult.findings.low}
                          </div>
                          <div className="text-xs text-slate-600">Low</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {scanResult.findings.info}
                          </div>
                          <div className="text-xs text-slate-600">Info</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compliance Score</span>
                          <span className="font-medium">{(scanResult.compliance_score * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={scanResult.compliance_score * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Recommendations:</span>
                        <ul className="text-sm text-slate-700 mt-1 space-y-1">
                          {scanResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-slate-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}