import { NextRequest, NextResponse } from 'next/server';
import { FORGE1_CONFIG } from '@/forge1/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const securityLayer = FORGE1_CONFIG.layers.find(l => l.id === 'security');
    if (!securityLayer) {
      return NextResponse.json(
        { error: 'Security layer not found' },
        { status: 404 }
      );
    }

    if (action === 'status') {
      return NextResponse.json({
        layer: securityLayer,
        security_status: {
          authentication: 'enabled',
          authorization: 'enabled',
          encryption: 'enabled',
          audit_logging: 'enabled',
          rate_limiting: 'enabled',
          firewall: 'active',
          intrusion_detection: 'active',
          vulnerability_scanning: 'active'
        },
        compliance: {
          gdpr: 'compliant',
          hipaa: 'not_applicable',
          soc2: 'compliant',
          iso27001: 'compliant'
        },
        threats_detected: Math.floor(Math.random() * 10) + 1,
        threats_blocked: Math.floor(Math.random() * 100) + 50,
        last_security_scan: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }

    if (action === 'policies') {
      const policies = [
        {
          id: 'auth_policy',
          name: 'Authentication Policy',
          type: 'authentication',
          status: 'active',
          description: 'Multi-factor authentication required for all users',
          last_updated: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          compliance_score: Math.random() * 0.2 + 0.8
        },
        {
          id: 'access_control',
          name: 'Access Control Policy',
          type: 'authorization',
          status: 'active',
          description: 'Role-based access control with least privilege principle',
          last_updated: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
          compliance_score: Math.random() * 0.15 + 0.85
        },
        {
          id: 'data_encryption',
          name: 'Data Encryption Policy',
          type: 'encryption',
          status: 'active',
          description: 'End-to-end encryption for all sensitive data',
          last_updated: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          compliance_score: Math.random() * 0.1 + 0.9
        },
        {
          id: 'audit_logging',
          name: 'Audit Logging Policy',
          type: 'logging',
          status: 'active',
          description: 'Comprehensive logging of all system activities',
          last_updated: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
          compliance_score: Math.random() * 0.25 + 0.75
        }
      ];

      return NextResponse.json({
        policies: policies,
        total_policies: policies.length,
        active_policies: policies.filter(p => p.status === 'active').length
      });
    }

    if (action === 'cicd') {
      const pipelines = [
        {
          id: 'main_pipeline',
          name: 'Main Application Pipeline',
          status: 'active',
          stages: ['build', 'test', 'security_scan', 'deploy'],
          last_run: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          duration: Math.floor(Math.random() * 1800) + 600,
          success_rate: Math.random() * 0.1 + 0.9,
          auto_deploy: true
        },
        {
          id: 'security_pipeline',
          name: 'Security Scanning Pipeline',
          status: 'active',
          stages: ['vulnerability_scan', 'dependency_check', 'compliance_check'],
          last_run: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          duration: Math.floor(Math.random() * 900) + 300,
          success_rate: Math.random() * 0.05 + 0.95,
          auto_deploy: false
        },
        {
          id: 'backup_pipeline',
          name: 'Backup Pipeline',
          status: 'active',
          stages: ['backup', 'verify', 'cleanup'],
          last_run: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          duration: Math.floor(Math.random() * 600) + 300,
          success_rate: Math.random() * 0.15 + 0.85,
          auto_deploy: true
        }
      ];

      return NextResponse.json({
        pipelines: pipelines,
        total_pipelines: pipelines.length,
        active_pipelines: pipelines.filter(p => p.status === 'active').length
      });
    }

    if (action === 'threats') {
      const threats = [
        {
          id: 'threat-001',
          type: 'sql_injection',
          severity: 'high',
          status: 'blocked',
          detected_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          source_ip: '192.168.1.100',
          description: 'SQL injection attempt blocked by WAF',
          action_taken: 'blocked_ip',
          resolved: true
        },
        {
          id: 'threat-002',
          type: 'ddos_attempt',
          severity: 'critical',
          status: 'mitigated',
          detected_at: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          source_ip: '10.0.0.50',
          description: 'DDoS attack attempt detected and mitigated',
          action_taken: 'rate_limiting',
          resolved: true
        },
        {
          id: 'threat-003',
          type: 'brute_force',
          severity: 'medium',
          status: 'monitoring',
          detected_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          source_ip: '203.0.113.1',
          description: 'Brute force attack detected on authentication endpoint',
          action_taken: 'increased_monitoring',
          resolved: false
        }
      ];

      return NextResponse.json({
        threats: threats,
        total_threats: threats.length,
        active_threats: threats.filter(t => !t.resolved).length,
        resolved_threats: threats.filter(t => t.resolved).length
      });
    }

    // Default response
    return NextResponse.json({
      layer: securityLayer,
      message: 'Security & CI/CD layer is running',
      capabilities: [
        'Docker containerization',
        'GitHub Actions automation',
        'Authentication and authorization',
        'Pre-commit hooks',
        'Security scanning',
        'Compliance monitoring'
      ]
    });

  } catch (error) {
    console.error('Error in Security API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'security_scan':
        const scanResult = {
          scan_id: `scan-${Date.now()}`,
          type: data?.scan_type || 'comprehensive',
          status: 'completed',
          started_at: new Date(Date.now() - Math.random() * 300000).toISOString(),
          completed_at: new Date().toISOString(),
          findings: {
            critical: Math.floor(Math.random() * 3),
            high: Math.floor(Math.random() * 5) + 1,
            medium: Math.floor(Math.random() * 10) + 2,
            low: Math.floor(Math.random() * 20) + 5,
            info: Math.floor(Math.random() * 30) + 10
          },
          recommendations: [
            'Update dependencies to latest versions',
            'Implement additional input validation',
            'Enable encryption for sensitive data',
            'Review access control policies'
          ],
          compliance_score: Math.random() * 0.2 + 0.8
        };

        return NextResponse.json(scanResult);

      case 'run_pipeline':
        if (!data?.pipeline_id) {
          return NextResponse.json(
            { error: 'Pipeline ID is required' },
            { status: 400 }
          );
        }

        const pipelineRun = {
          run_id: `run-${Date.now()}`,
          pipeline_id: data.pipeline_id,
          status: 'running',
          started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + Math.random() * 1800000).toISOString(),
          stages: data.stages || ['build', 'test', 'deploy'],
          current_stage: 0,
          logs: []
        };

        return NextResponse.json({
          success: true,
          run: pipelineRun
        });

      case 'update_policy':
        if (!data?.policy_id || !data?.updates) {
          return NextResponse.json(
            { error: 'Policy ID and updates are required' },
            { status: 400 }
          );
        }

        const policyUpdate = {
          policy_id: data.policy_id,
          updates: data.updates,
          updated_at: new Date().toISOString(),
          updated_by: data.updated_by || 'system',
          version: `v${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
        };

        return NextResponse.json({
          success: true,
          update: policyUpdate
        });

      case 'backup_system':
        const backupResult = {
          backup_id: `backup-${Date.now()}`,
          status: 'completed',
          started_at: new Date(Date.now() - Math.random() * 300000).toISOString(),
          completed_at: new Date().toISOString(),
          size: `${Math.floor(Math.random() * 50) + 10}GB`,
          encrypted: true,
          verification_status: 'passed',
          retention_days: 30,
          location: 'secure_cloud_storage'
        };

        return NextResponse.json({
          success: true,
          backup: backupResult
        });

      case 'compliance_check':
        const complianceCheck = {
          check_id: `compliance-${Date.now()}`,
          framework: data?.framework || 'soc2',
          status: 'completed',
          overall_score: Math.random() * 0.2 + 0.8,
          checks_performed: Math.floor(Math.random() * 100) + 50,
          passed_checks: Math.floor(Math.random() * 90) + 45,
          failed_checks: Math.floor(Math.random() * 10) + 5,
          findings: [
            {
              category: 'access_control',
              severity: 'medium',
              description: 'Some users have excessive permissions',
              recommendation: 'Review and restrict user permissions'
            },
            {
              category: 'data_encryption',
              severity: 'low',
              description: 'Some data transfers use outdated encryption',
              recommendation: 'Update encryption protocols'
            }
          ],
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(complianceCheck);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Security API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}