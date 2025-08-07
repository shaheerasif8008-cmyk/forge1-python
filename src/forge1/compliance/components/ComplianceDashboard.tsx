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
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Scale,
  Eye,
  FileCheck,
  AlertCircle,
  Plus,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Database
} from "lucide-react";
import { ComplianceService, ComplianceCheck, ComplianceFramework, ComplianceReport } from "../service";

const complianceService = new ComplianceService();

export default function ComplianceDashboard() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Form states
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ComplianceCheck['content_type']>('text');
  const [checkType, setCheckType] = useState<ComplianceCheck['check_type']>('legal');
  const [frameworkName, setFrameworkName] = useState("");
  const [frameworkDescription, setFrameworkDescription] = useState("");
  const [frameworkRegulations, setFrameworkRegulations] = useState("");

  useEffect(() => {
    loadFrameworks();
    loadChecks();
    loadReports();
  }, []);

  const loadFrameworks = async () => {
    const frameworkList = await complianceService.getComplianceFrameworks();
    setFrameworks(frameworkList);
  };

  const loadChecks = async () => {
    // In production, load from API
    const mockChecks: ComplianceCheck[] = [
      {
        id: "check_1",
        content_type: "text",
        content: "Sample content for compliance check",
        check_type: "legal",
        result: {
          status: "compliant",
          violations: [],
          recommendations: [],
          risk_score: 0.1,
          details: { analysis: "No issues found" }
        },
        confidence: 0.95,
        processing_time: 500,
        created_at: new Date()
      }
    ];
    setChecks(mockChecks);
  };

  const loadReports = async () => {
    // In production, load from API
    const mockReports: ComplianceReport[] = [
      {
        id: "report_1",
        title: "Monthly Compliance Report",
        description: "Comprehensive compliance analysis for the month",
        framework_id: "gdpr",
        checks: [],
        summary: {
          total_checks: 10,
          compliant: 8,
          non_compliant: 1,
          warnings: 1,
          review_required: 0,
          overall_risk_score: 0.2,
          critical_issues: 0
        },
        generated_at: new Date()
      }
    ];
    setReports(mockReports);
  };

  const handleCheckCompliance = async () => {
    if (!content) return;

    setIsChecking(true);
    try {
      const check = await complianceService.checkCompliance(
        content,
        contentType,
        checkType,
        selectedFramework?.id
      );
      setChecks(prev => [check, ...prev]);
      setSelectedCheck(check);
      setContent("");
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateFramework = async () => {
    if (!frameworkName || !frameworkDescription) return;

    try {
      const regulations = frameworkRegulations.split('\n').filter(r => r.trim());
      const newFramework = await complianceService.createComplianceFramework({
        name: frameworkName,
        description: frameworkDescription,
        regulations
      });

      setFrameworks(prev => [...prev, newFramework]);
      setFrameworkName("");
      setFrameworkDescription("");
      setFrameworkRegulations("");
    } catch (error) {
      console.error('Framework creation failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedFramework || checks.length === 0) return;

    setIsGeneratingReport(true);
    try {
      const report = await complianceService.generateComplianceReport(
        `Compliance Report - ${selectedFramework.name}`,
        `Automated compliance report for ${selectedFramework.name}`,
        selectedFramework.id,
        checks.filter(check => check.check_type === 'legal')
      );

      setReports(prev => [report, ...prev]);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'review_required':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'review_required':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance & Legal Layer</h2>
          <p className="text-muted-foreground">
            Advanced compliance monitoring with LLMR (Legal/ethics checker AI)
          </p>
        </div>
      </div>

      <Tabs defaultValue="checks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checks">Compliance Checks</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Compliance Check</span>
                </CardTitle>
                <CardDescription>
                  Analyze content for compliance violations
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
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="conversation">Conversation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="checkType">Check Type</Label>
                  <Select value={checkType} onValueChange={(value: any) => setCheckType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="ethical">Ethical</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="selectedFramework">Compliance Framework</Label>
                  <Select value={selectedFramework?.id || ''} onValueChange={(value) => {
                    const framework = frameworks.find(f => f.id === value);
                    setSelectedFramework(framework || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content to Check</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter content to check for compliance"
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={handleCheckCompliance} 
                  disabled={isChecking || !content}
                  className="w-full"
                >
                  {isChecking ? "Checking..." : "Check Compliance"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Checks</CardTitle>
                <CardDescription>
                  View recent compliance check results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCheck?.id === check.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCheck(check)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check.result.status)}
                          <span className="font-medium capitalize">{check.result.status.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(check.result.status)}>
                          {Math.round(check.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {check.content_type} • {check.check_type} • {check.result.violations.length} violations
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Risk Score: {Math.round(check.result.risk_score * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Framework</span>
                </CardTitle>
                <CardDescription>
                  Define a new compliance framework
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="frameworkName">Framework Name</Label>
                  <Input
                    id="frameworkName"
                    value={frameworkName}
                    onChange={(e) => setFrameworkName(e.target.value)}
                    placeholder="Enter framework name"
                  />
                </div>
                <div>
                  <Label htmlFor="frameworkDescription">Description</Label>
                  <Textarea
                    id="frameworkDescription"
                    value={frameworkDescription}
                    onChange={(e) => setFrameworkDescription(e.target.value)}
                    placeholder="Describe the compliance framework"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="frameworkRegulations">Regulations (one per line)</Label>
                  <Textarea
                    id="frameworkRegulations"
                    value={frameworkRegulations}
                    onChange={(e) => setFrameworkRegulations(e.target.value)}
                    placeholder="Enter regulations, one per line"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateFramework} 
                  disabled={!frameworkName || !frameworkDescription}
                  className="w-full"
                >
                  Create Framework
                </Button>
              </CardContent>
            </Card>

            {/* Frameworks List */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Frameworks</CardTitle>
                <CardDescription>
                  Available compliance frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {frameworks.map((framework) => (
                    <div
                      key={framework.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFramework?.id === framework.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFramework(framework)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{framework.name}</div>
                        {framework.active && <Badge variant="outline">Active</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{framework.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {framework.regulations.length} regulations
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5" />
                  <span>Generate Report</span>
                </CardTitle>
                <CardDescription>
                  Create comprehensive compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Framework</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {selectedFramework ? (
                      <div>
                        <div className="font-medium">{selectedFramework.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedFramework.regulations.length} regulations
                        </div>
                      </div>
                    ) : (
                      "No framework selected"
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Available Checks</Label>
                  <div className="p-3 border rounded bg-gray-50">
                    {checks.filter(c => c.check_type === 'legal').length} legal checks available
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGeneratingReport || !selectedFramework || checks.length === 0}
                  className="w-full"
                >
                  {isGeneratingReport ? "Generating..." : "Generate Report"}
                </Button>
              </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>
                  Generated compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{report.title}</div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">{report.description}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-gray-500">Compliant:</span>
                          <span className="ml-1 font-medium text-green-600">{report.summary.compliant}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Violations:</span>
                          <span className="ml-1 font-medium text-red-600">{report.summary.non_compliant}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Risk Score:</span>
                          <span className="ml-1 font-medium">{Math.round(report.summary.overall_risk_score * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Critical:</span>
                          <span className="ml-1 font-medium text-red-600">{report.summary.critical_issues}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Check Details</span>
                </CardTitle>
                <CardDescription>
                  Detailed compliance check results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCheck ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedCheck.result.status)}
                          <span className="font-medium capitalize">{selectedCheck.result.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Risk Score</div>
                        <div className="font-medium">{Math.round(selectedCheck.result.risk_score * 100)}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Violations</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedCheck.result.violations.length > 0 ? (
                          selectedCheck.result.violations.map((violation, index) => (
                            <div key={index} className="p-2 border rounded text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{violation.type}</span>
                                <div className={`w-2 h-2 rounded-full ${getSeverityColor(violation.severity)}`} />
                              </div>
                              <div className="text-xs text-gray-600">{violation.description}</div>
                              {violation.regulation && (
                                <div className="text-xs text-blue-600 mt-1">{violation.regulation}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-green-600">No violations found</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Recommendations</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedCheck.result.recommendations.length > 0 ? (
                          selectedCheck.result.recommendations.map((recommendation, index) => (
                            <div key={index} className="p-2 border rounded text-sm">
                              <div className="font-medium">{recommendation.type}</div>
                              <div className="text-xs text-gray-600">{recommendation.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No recommendations</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a compliance check to view details
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Compliance Metrics</span>
                </CardTitle>
                <CardDescription>
                  Overall compliance statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {checks.filter(c => c.result.status === 'compliant').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {checks.filter(c => c.result.status === 'non_compliant').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Non-compliant</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Compliance Rate</span>
                      <span className="font-medium">
                        {checks.length > 0 ? Math.round((checks.filter(c => c.result.status === 'compliant').length / checks.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={checks.length > 0 ? (checks.filter(c => c.result.status === 'compliant').length / checks.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Risk Score</span>
                      <span className="font-medium">
                        {checks.length > 0 ? Math.round((checks.reduce((sum, c) => sum + c.result.risk_score, 0) / checks.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={checks.length > 0 ? (checks.reduce((sum, c) => sum + c.result.risk_score, 0) / checks.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {checks.filter(c => c.result.status === 'warning').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Warnings</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {checks.filter(c => c.result.status === 'review_required').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Review</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {checks.reduce((sum, c) => sum + c.result.violations.filter(v => v.severity === 'critical').length, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Critical</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}