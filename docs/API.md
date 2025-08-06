# API Reference

This document provides comprehensive API reference for Cognisia's Forge 1 backend services.

## 🌐 Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.yourdomain.com/api`

## 🔐 Authentication

All API endpoints (except authentication endpoints) require JWT authentication.

### Header Format
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

#### 1. User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### 3. Token Verification
```http
GET /auth/verify
Authorization: Bearer <token>
```

## 🤖 AI Agents API

### List Agents

```http
GET /agents?skip=0&limit=100&status=ready
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `status` (string, optional): Filter by agent status (training, ready, deployed, inactive)

**Response:**
```json
[
  {
    "id": "agent-123",
    "name": "Customer Service Agent",
    "type": "specialist",
    "role": "Customer Support",
    "status": "ready",
    "capabilities": ["customer_service", "empathy", "problem_solving"],
    "config": {
      "voice": {"pitch": 1.0, "speed": 1.0},
      "tone": "professional",
      "skills": ["communication", "empathy"],
      "llm_blend": {"primary_model": "gpt-4o", "weights": {}}
    },
    "performance": {
      "response_time": 0.5,
      "accuracy": 0.95,
      "user_satisfaction": 4.8
    },
    "user_id": "user-123",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Agent

```http
POST /agents
Content-Type: application/json

{
  "name": "Sales Assistant",
  "type": "specialist",
  "role": "Sales Representative",
  "capabilities": ["sales", "product_knowledge", "negotiation"],
  "config": {
    "voice": {
      "pitch": 1.1,
      "speed": 0.9,
      "emotion": "professional",
      "accent": "american"
    },
    "tone": "enthusiastic",
    "background": "Experienced sales professional with 5+ years in B2B sales",
    "skills": ["communication", "persuasion", "product_expertise"],
    "memory_type": "long_term",
    "ui_theme": "modern",
    "llm_blend": {
      "primary_model": "gpt-4o",
      "secondary_models": ["claude-opus-4"],
      "weights": {"gpt-4o": 0.7, "claude-opus-4": 0.3}
    },
    "emotional_range": {
      "enthusiasm": 0.8,
      "empathy": 0.6,
      "professionalism": 0.9
    },
    "multimodal": true,
    "emotional_intelligence": true
  },
  "performance": {
    "response_time": 0.0,
    "accuracy": 0.0,
    "user_satisfaction": 0.0,
    "tasks_completed": 0,
    "error_rate": 0.0,
    "uptime": 100.0
  }
}
```

### Get Agent

```http
GET /agents/{agent_id}
```

**Response:** Single agent object (same structure as create response)

### Update Agent

```http
PUT /agents/{agent_id}
Content-Type: application/json

{
  "name": "Updated Agent Name",
  "role": "Senior Sales Representative",
  "capabilities": ["sales", "leadership", "training"],
  "config": {
    "tone": "authoritative"
  },
  "status": "deployed"
}
```

### Delete Agent

```http
DELETE /agents/{agent_id}
```

### Deploy Agent

```http
POST /agents/{agent_id}/deploy
```

### Test Agent

```http
POST /agents/{agent_id}/test
```

## 💬 Conversations API

### List Conversations

```http
GET /conversations?agent_id=agent-123&skip=0&limit=50
```

**Query Parameters:**
- `agent_id` (string, optional): Filter by agent ID
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

### Create Conversation

```http
POST /conversations
Content-Type: application/json

{
  "agent_id": "agent-123",
  "messages": [
    {
      "role": "user",
      "content": "Hello, I need help with my order",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "title": "Order Help Request"
}
```

### Get Conversation

```http
GET /conversations/{conversation_id}
```

### Add Message

```http
POST /conversations/{conversation_id}/message
Content-Type: application/json

{
  "role": "assistant",
  "content": "I'd be happy to help you with your order. Could you please provide your order number?",
  "timestamp": "2024-01-01T00:01:00Z",
  "metadata": {
    "model_used": "gpt-4o",
    "confidence": 0.95
  }
}
```

### Delete Conversation

```http
DELETE /conversations/{conversation_id}
```

## 📊 Analytics API

### List Analytics Events

```http
GET /analytics?event_type=agent_created&agent_id=agent-123&start_date=2024-01-01&end_date=2024-01-31
```

**Query Parameters:**
- `event_type` (string, optional): Filter by event type
- `agent_id` (string, optional): Filter by agent ID
- `start_date` (string, optional): Start date (ISO format)
- `end_date` (string, optional): End date (ISO format)
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

### Get Dashboard Analytics

```http
GET /analytics/dashboard
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard analytics retrieved successfully",
  "data": {
    "total_agents": 15,
    "agent_status_distribution": {
      "ready": 8,
      "deployed": 5,
      "training": 2
    },
    "recent_events": [
      {
        "id": "event-123",
        "event_type": "agent_created",
        "timestamp": "2024-01-01T00:00:00Z",
        "metrics": {
          "processing_time": 1500,
          "success": true
        }
      }
    ],
    "event_type_distribution": {
      "agent_created": 10,
      "agent_deployed": 5,
      "user_login": 25
    },
    "average_processing_time": 1200.5,
    "period": "last_30_days"
  }
}
```

### Get Agent Performance

```http
GET /analytics/agents/{agent_id}/performance?days=30
```

**Query Parameters:**
- `days` (integer, optional): Number of days to analyze (default: 30)

### Create Analytics Event

```http
POST /analytics
Content-Type: application/json

{
  "event_type": "agent_created",
  "event_data": {
    "agent_id": "agent-123",
    "agent_name": "New Agent"
  },
  "metrics": {
    "processing_time": 1500,
    "success": true,
    "memory_usage": 51200000
  },
  "processing_time": 1500
}
```

## 🛠️ Tools API

### List Tool Executions

```http
GET /tools?agent_id=agent-123&tool_name=web_search&skip=0&limit=100
```

**Query Parameters:**
- `agent_id` (string, optional): Filter by agent ID
- `conversation_id` (string, optional): Filter by conversation ID
- `tool_name` (string, optional): Filter by tool name
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

### Execute Tool

```http
POST /tools
Content-Type: application/json

{
  "tool_name": "web_search",
  "parameters": {
    "query": "latest AI developments 2024",
    "num_results": 10
  },
  "agent_id": "agent-123",
  "conversation_id": "conv-123"
}
```

### Get Available Tools

```http
GET /tools/tools
```

**Response:**
```json
{
  "success": true,
  "message": "Available tools retrieved successfully",
  "data": [
    {
      "name": "web_search",
      "description": "Search the web for information",
      "parameters": {
        "query": {
          "type": "string",
          "required": true,
          "description": "Search query"
        },
        "num_results": {
          "type": "integer",
          "required": false,
          "default": 10,
          "description": "Number of results"
        }
      }
    },
    {
      "name": "file_read",
      "description": "Read a file from the system",
      "parameters": {
        "file_path": {
          "type": "string",
          "required": true,
          "description": "Path to the file"
        }
      }
    }
  ]
}
```

### Get Tool Statistics

```http
GET /tools/stats
```

## 🔥 Forge 1 API

### Process Multimodal Input

```http
POST /forge1/multimodal
Content-Type: application/json

{
  "type": "text",
  "data": {
    "text": "Analyze this customer feedback and provide insights",
    "context": {
      "customer_id": "cust-123",
      "product": "premium_subscription"
    }
  },
  "processing_options": {
    "tasks": ["analyze", "summarize", "extract_entities"],
    "emotion_analysis": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Multimodal processing completed successfully",
  "data": {
    "input_type": "text",
    "text_length": 45,
    "tasks_completed": ["analyze", "summarize"],
    "results": {
      "analysis": {
        "sentiment": "positive",
        "key_themes": ["customer_satisfaction", "product_value"],
        "complexity": "medium"
      },
      "summary": "Customer expresses positive feedback about premium subscription value"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Multi-LLM Orchestration

```http
POST /forge1/multi-llm
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Write a comprehensive business plan for a tech startup"
    }
  ],
  "config": {
    "primary_model": "gpt-4o",
    "secondary_models": ["claude-opus-4", "gemini-flash-2.5"],
    "routing_strategy": "auto",
    "model_weights": {
      "gpt-4o": 0.6,
      "claude-opus-4": 0.3,
      "gemini-flash-2.5": 0.1
    },
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "context": {
    "industry": "technology",
    "company_stage": "startup"
  }
}
```

### Emotional Intelligence Processing

```http
POST /forge1/emotional-intelligence
Content-Type: application/json

{
  "text": "I'm really frustrated with this service. Nothing seems to work properly!",
  "context": {
    "customer_history": "first_time_user",
    "issue_severity": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emotional intelligence processing completed successfully",
  "data": {
    "emotion_analysis": {
      "primary_emotion": "angry",
      "secondary_emotions": ["frustrated"],
      "sentiment": "negative",
      "intensity": "high",
      "confidence": 0.85,
      "keywords_found": ["frustrated", "nothing", "work"],
      "tone_indicators": {
        "frustrated": ["really frustrated", "nothing seems"]
      }
    },
    "response": "I understand your frustration, and I'm truly sorry that you're experiencing these issues. Your feelings are completely valid, and I want to help resolve this for you right away.",
    "empathy_level": "high",
    "processing_time": 1.2
  }
}
```

### Agent Chat

```http
POST /forge1/agent/{agent_id}/chat
Content-Type: application/json

{
  "message": "Can you help me understand the features of your premium plan?",
  "context": {
    "user_id": "user-123",
    "session_id": "session-456",
    "previous_messages": []
  }
}
```

### Get Available Models

```http
GET /forge1/models
```

**Response:**
```json
{
  "success": true,
  "message": "Available models retrieved successfully",
  "data": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "capabilities": ["text", "code", "reasoning", "multimodal"],
      "max_tokens": 128000,
      "cost_per_1k_tokens": 0.01
    },
    {
      "id": "claude-opus-4",
      "name": "Claude Opus 4",
      "provider": "Anthropic",
      "capabilities": ["text", "reasoning", "analysis"],
      "max_tokens": 200000,
      "cost_per_1k_tokens": 0.015
    }
  ]
}
```

### Test Agent

```http
POST /forge1/test-agent
Content-Type: application/json

{
  "agent_id": "agent-123",
  "test_type": "stress",
  "custom_message": "Explain quantum computing to a 5-year-old"
}
```

## 🏥 Health API

### System Health

```http
GET /health/
```

**Response:**
```json
{
  "success": true,
  "message": "Health status retrieved successfully",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "system": {
      "cpu_percent": 45.2,
      "memory_percent": 67.8,
      "memory_available": 3251226624,
      "disk_percent": 82.1,
      "disk_free": 17825792000
    },
    "services": {
      "database": "healthy",
      "ai_services": "healthy",
      "socket_io": "healthy"
    }
  }
}
```

### Database Health

```http
GET /health/database
```

### AI Services Health

```http
GET /health/ai-services
```

### System Metrics

```http
GET /health/metrics
```

### System Uptime

```http
GET /health/uptime
```

## 📋 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "data": null
}
```

## 🔄 WebSocket Events

### Connection Events

#### Client to Server
```javascript
// Join agent room
socket.emit('join_agent_room', { agent_id: 'agent-123' });

// Leave agent room
socket.emit('leave_agent_room', { agent_id: 'agent-123' });
```

#### Server to Client
```javascript
// Connection established
socket.on('connection_established', (data) => {
  console.log('Connected:', data.message);
});

// Room joined
socket.on('joined_room', (data) => {
  console.log('Joined room:', data.room);
});

// Room left
socket.on('left_room', (data) => {
  console.log('Left room:', data.room);
});

// Agent status update
socket.on('agent_status_update', (data) => {
  console.log('Agent status:', data);
});
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Validation Error - Input validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## 📊 Rate Limiting

- **Default Limit**: 100 requests per minute per IP
- **Authentication**: 1000 requests per minute per user
- **File Upload**: 10 uploads per minute per user

Headers included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## 🔍 Data Models

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  type: 'white_collar' | 'specialist' | 'generalist';
  role: string;
  capabilities: string[];
  status: 'training' | 'ready' | 'deployed' | 'inactive';
  config: AgentConfig;
  performance: AgentPerformance;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### AgentConfig
```typescript
interface AgentConfig {
  voice: {
    pitch: number;
    speed: number;
    emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'professional';
    accent: 'american' | 'british' | 'australian' | 'neutral';
  };
  tone: string;
  background: string;
  skills: string[];
  memory_type: string;
  ui_theme: string;
  llm_blend: {
    primary_model: string;
    secondary_models: string[];
    weights: Record<string, number>;
  };
  emotional_range: Record<string, number>;
  multimodal: boolean;
  emotional_intelligence: boolean;
}
```

### Message
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

---

This API reference covers all available endpoints in Cognisia's Forge 1. For interactive API documentation, visit `/docs` when the backend is running.