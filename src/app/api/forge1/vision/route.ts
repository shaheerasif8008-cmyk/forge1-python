import { NextRequest, NextResponse } from 'next/server';
import { VisionService } from '@/forge1/vision/service';

const visionService = new VisionService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'analyze_image':
        const { imageUrl, analysisTypes } = data;
        const analysis = await visionService.analyzeImage(imageUrl, analysisTypes);
        return NextResponse.json({ success: true, data: analysis });

      case 'generate_description':
        const { imageUrl: descUrl } = data;
        const description = await visionService.generateImageDescription(descUrl);
        return NextResponse.json({ success: true, data: { description } });

      case 'compare_images':
        const { imageUrl1, imageUrl2 } = data;
        const comparison = await visionService.compareImages(imageUrl1, imageUrl2);
        return NextResponse.json({ success: true, data: comparison });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Vision API error:', error);
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
      case 'get_analysis':
        const analysisId = searchParams.get('id');
        if (!analysisId) {
          return NextResponse.json({ success: false, error: 'Analysis ID required' }, { status: 400 });
        }
        const analysis = await visionService.getVisionAnalysis(analysisId);
        return NextResponse.json({ success: true, data: analysis });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}