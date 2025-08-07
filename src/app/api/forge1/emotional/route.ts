import { NextRequest, NextResponse } from 'next/server';
import { EmotionalAIService } from '@/forge1/emotional/service';

const emotionalAIService = new EmotionalAIService();

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'analyze_emotion':
        const { content, contentType, analysisType } = data;
        const analysis = await emotionalAIService.analyzeEmotion(content, contentType, analysisType);
        return NextResponse.json({ success: true, data: analysis });

      case 'create_profile':
        const profile = await emotionalAIService.createEmotionalProfile(data);
        return NextResponse.json({ success: true, data: profile });

      case 'analyze_conversation':
        const { messages } = data;
        const conversation = await emotionalAIService.analyzeConversation(messages);
        return NextResponse.json({ success: true, data: conversation });

      case 'generate_response':
        const { inputContent, targetEmotion, context } = data;
        const response = await emotionalAIService.generateEmotionalResponse(inputContent, targetEmotion, context);
        return NextResponse.json({ success: true, data: { response } });

      case 'track_trends':
        const { profileId, timeRange } = data;
        const trends = await emotionalAIService.trackEmotionalTrends(profileId, timeRange);
        return NextResponse.json({ success: true, data: trends });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Emotional AI API error:', error);
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
        const analysis = await emotionalAIService.getEmotionalAnalysis(analysisId);
        return NextResponse.json({ success: true, data: analysis });

      case 'get_profile':
        const profileId = searchParams.get('id');
        if (!profileId) {
          return NextResponse.json({ success: false, error: 'Profile ID required' }, { status: 400 });
        }
        const profile = await emotionalAIService.getEmotionalProfile(profileId);
        return NextResponse.json({ success: true, data: profile });

      case 'get_conversation':
        const conversationId = searchParams.get('id');
        if (!conversationId) {
          return NextResponse.json({ success: false, error: 'Conversation ID required' }, { status: 400 });
        }
        const conversation = await emotionalAIService.getEmotionalConversation(conversationId);
        return NextResponse.json({ success: true, data: conversation });

      case 'get_profiles':
        const profiles = await emotionalAIService.getEmotionalProfiles();
        return NextResponse.json({ success: true, data: profiles });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Emotional AI API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}