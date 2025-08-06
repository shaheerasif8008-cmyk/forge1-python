from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class AgentType(str, Enum):
    WHITE_COLLAR = "white_collar"
    SPECIALIST = "specialist"
    GENERALIST = "generalist"

class AgentStatus(str, Enum):
    TRAINING = "training"
    READY = "ready"
    DEPLOYED = "deployed"
    INACTIVE = "inactive"

class EventType(str, Enum):
    AGENT_CREATED = "agent_created"
    AGENT_TESTED = "agent_tested"
    AGENT_DEPLOYED = "agent_deployed"
    AGENT_UPDATED = "agent_updated"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    TOOL_EXECUTION = "tool_execution"
    SYSTEM_ERROR = "system_error"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Agent schemas
class AgentConfig(BaseModel):
    voice: Dict[str, Any] = {}
    tone: str = "professional"
    background: str = ""
    skills: List[str] = []
    memory_type: str = "short_term"
    ui_theme: str = "default"
    llm_blend: Dict[str, float] = {}
    emotional_range: Dict[str, float] = {}
    multimodal: bool = False
    emotional_intelligence: bool = True

class AgentPerformance(BaseModel):
    response_time: float = 0.0
    accuracy: float = 0.0
    user_satisfaction: float = 0.0
    tasks_completed: int = 0
    error_rate: float = 0.0
    uptime: float = 100.0

class AIAgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: AgentType
    role: str = Field(..., min_length=1, max_length=100)
    capabilities: List[str] = []
    config: AgentConfig = Field(default_factory=AgentConfig)
    performance: AgentPerformance = Field(default_factory=AgentPerformance)

class AIAgentCreate(AIAgentBase):
    pass

class AIAgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    capabilities: Optional[List[str]] = None
    config: Optional[AgentConfig] = None
    status: Optional[AgentStatus] = None

class AIAgentResponse(AIAgentBase):
    id: str
    status: AgentStatus
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Conversation schemas
class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class ConversationBase(BaseModel):
    messages: List[Message]
    title: Optional[str] = None

class ConversationCreate(ConversationBase):
    agent_id: str

class ConversationResponse(ConversationBase):
    id: str
    agent_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsBase(BaseModel):
    event_type: EventType
    event_data: Dict[str, Any]
    metrics: Dict[str, Any]
    processing_time: Optional[int] = None

class AnalyticsCreate(AnalyticsBase):
    user_id: Optional[str] = None
    agent_id: Optional[str] = None

class AnalyticsResponse(AnalyticsBase):
    id: str
    user_id: Optional[str]
    agent_id: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Tool execution schemas
class ToolExecutionBase(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result: Dict[str, Any]
    success: bool
    processing_time: int
    error: Optional[str] = None

class ToolExecutionCreate(ToolExecutionBase):
    agent_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ToolExecutionResponse(ToolExecutionBase):
    id: str
    agent_id: Optional[str]
    conversation_id: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Multi-LLM schemas
class LLMModel(str, Enum):
    GPT_4O = "gpt-4o"
    CLAUDE_OPUS_4 = "claude-opus-4"
    GEMINI_FLASH_2_5 = "gemini-flash-2.5"
    GPT_4_TURBO = "gpt-4-turbo"
    CLAUDE_3_SONNET = "claude-3-sonnet"

class MultiLLMConfig(BaseModel):
    primary_model: LLMModel
    secondary_models: List[LLMModel] = []
    routing_strategy: str = "auto"  # auto, manual, load_balance
    model_weights: Dict[LLMModel, float] = {}
    temperature: float = 0.7
    max_tokens: int = 2000

class MultiLLMRequest(BaseModel):
    messages: List[Dict[str, str]]
    config: MultiLLMConfig
    context: Optional[Dict[str, Any]] = None

class MultiLLMResponse(BaseModel):
    response: str
    model_used: LLMModel
    processing_time: float
    token_usage: Dict[str, int]
    confidence: float

# System health schemas
class SystemHealth(BaseModel):
    status: str
    database: Dict[str, Any]
    ai_services: Dict[str, Any]
    memory_usage: Dict[str, Any]
    cpu_usage: float
    active_agents: int
    uptime: str

# Response schemas
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None