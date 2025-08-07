import { NextRequest, NextResponse } from 'next/server';
import { ComplianceService } from '@/forge1/compliance/service';

const complianceService = new ComplianceService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'check_compliance':
        const { content, contentType, checkType, frameworkId } = data;
        const check = await complianceService.checkCompliance(content, contentType, checkType, frameworkId);
        return NextResponse.json({ success: true, data: check });

      case 'create_framework':
        const framework = await complianceService.createComplianceFramework(data);
        return NextResponse.json({ success: true, data: framework });

      case 'generate_report':
        const { title, description, frameworkId: reportFrameworkId, checks } = data;
        const report = await complianceService.generateComplianceReport(title, description, reportFrameworkId, checks);
        return NextResponse.json({ success: true, data: report });

      case 'scan_document':
        const { documentContent, frameworkIds } = data;
        const documentChecks = await complianceService.scanDocumentForCompliance(documentContent, frameworkIds);
        return NextResponse.json({ success: true, data: documentChecks });

      case 'assess_risk':
        const { content: riskContent, contentType: riskContentType, context } = data;
        const riskAssessment = await complianceService.assessComplianceRisk(riskContent, riskContentType, context);
        return NextResponse.json({ success: true, data: riskAssessment });

      case 'generate_fix':
        const { violation, originalContent } = data;
        const fixedContent = await complianceService.generateComplianceFix(violation, originalContent);
        return NextResponse.json({ success: true, data: { fixedContent } });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get_check':
        const checkId = searchParams.get('id');
        if (!checkId) {
          return NextResponse.json({ success: false, error: 'Check ID required' }, { status: 400 });
        }
        const check = await complianceService.getComplianceCheck(checkId);
        return NextResponse.json({ success: true, data: check });

      case 'get_report':
        const reportId = searchParams.get('id');
        if (!reportId) {
          return NextResponse.json({ success: false, error: 'Report ID required' }, { status: 400 });
        }
        const report = await complianceService.getComplianceReport(reportId);
        return NextResponse.json({ success: true, data: report });

      case 'get_framework':
        const frameworkId = searchParams.get('id');
        if (!frameworkId) {
          return NextResponse.json({ success: false, error: 'Framework ID required' }, { status: 400 });
        }
        const framework = await complianceService.getComplianceFramework(frameworkId);
        return NextResponse.json({ success: true, data: framework });

      case 'get_frameworks':
        const frameworks = await complianceService.getComplianceFrameworks();
        return NextResponse.json({ success: true, data: frameworks });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}