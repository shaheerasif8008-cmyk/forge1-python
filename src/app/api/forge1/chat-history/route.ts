import { NextRequest, NextResponse } from 'next/server';
import { chatHistoryService } from '@/lib/chat-history-service';

// Mock user for now - in production, this would come from authentication
const MOCK_USER_ID = 'mock-user-123';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const agentId = searchParams.get('agentId');
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId') || MOCK_USER_ID;

    switch (action) {
      case 'get_sessions':
        if (agentId) {
          const sessions = await chatHistoryService.getSessionsByAgent(agentId, userId);
          return NextResponse.json({ success: true, sessions });
        } else {
          const sessions = await chatHistoryService.getSessionsByUser(userId);
          return NextResponse.json({ success: true, sessions });
        }

      case 'get_session':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        const session = await chatHistoryService.getSession(sessionId);
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, session });

      case 'get_messages':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        const messages = await chatHistoryService.getMessagesBySession(sessionId);
        return NextResponse.json({ success: true, messages });

      case 'get_agent_messages':
        if (!agentId) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const agentMessages = await chatHistoryService.getMessagesByAgent(agentId, limit);
        return NextResponse.json({ success: true, messages: agentMessages });

      case 'search_messages':
        const filter = {
          agentId: agentId || undefined,
          userId: userId,
          dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
            start: new Date(searchParams.get('startDate')!),
            end: new Date(searchParams.get('endDate')!)
          } : undefined,
          tags: searchParams.get('tags')?.split(',').filter(Boolean),
          searchQuery: searchParams.get('q') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
        };
        const searchResults = await chatHistoryService.searchMessages(filter);
        return NextResponse.json({ success: true, messages: searchResults });

      case 'get_analytics':
        const analytics = await chatHistoryService.getChatAnalytics(agentId || undefined, userId);
        return NextResponse.json({ success: true, analytics });

      case 'export':
        const exportFormat = (searchParams.get('format') as 'json' | 'csv') || 'json';
        const exportData = await chatHistoryService.exportChatHistory(agentId || undefined, exportFormat);
        
        if (exportFormat === 'json') {
          return NextResponse.json({
            success: true,
            data: exportData,
            filename: `chat-history-${agentId || 'all'}-${new Date().toISOString().split('T')[0]}.json`
          });
        } else {
          return new NextResponse(exportData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="chat-history-${agentId || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`
            }
          });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chat history GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = MOCK_USER_ID;

    switch (action) {
      case 'create_session':
        if (!data?.agentId) {
          return NextResponse.json(
            { error: 'Agent ID is required' },
            { status: 400 }
          );
        }
        const session = await chatHistoryService.createSession(data.agentId, userId, data.title);
        return NextResponse.json({ success: true, session });

      case 'add_message':
        if (!data?.sessionId || !data?.message) {
          return NextResponse.json(
            { error: 'Session ID and message are required' },
            { status: 400 }
          );
        }
        const message = await chatHistoryService.addMessage(data.sessionId, {
          ...data.message,
          agentId: data.message.agentId || 'unknown'
        });
        return NextResponse.json({ success: true, message });

      case 'update_session':
        if (!data?.sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        const updatedSession = await chatHistoryService.updateSession(data.sessionId, data.updates);
        if (!updatedSession) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, session: updatedSession });

      case 'update_message':
        if (!data?.messageId) {
          return NextResponse.json(
            { error: 'Message ID is required' },
            { status: 400 }
          );
        }
        const updatedMessage = await chatHistoryService.updateMessage(data.messageId, data.updates);
        if (!updatedMessage) {
          return NextResponse.json(
            { error: 'Message not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, message: updatedMessage });

      case 'delete_session':
        if (!data?.sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        const sessionDeleted = await chatHistoryService.deleteSession(data.sessionId);
        if (!sessionDeleted) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true });

      case 'delete_message':
        if (!data?.messageId) {
          return NextResponse.json(
            { error: 'Message ID is required' },
            { status: 400 }
          );
        }
        const messageDeleted = await chatHistoryService.deleteMessage(data.messageId);
        if (!messageDeleted) {
          return NextResponse.json(
            { error: 'Message not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true });

      case 'import':
        if (!data?.jsonData) {
          return NextResponse.json(
            { error: 'JSON data is required' },
            { status: 400 }
          );
        }
        const importResult = await chatHistoryService.importChatHistory(data.jsonData);
        return NextResponse.json({ success: true, ...importResult });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chat history POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}