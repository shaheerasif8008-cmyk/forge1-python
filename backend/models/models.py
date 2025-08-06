from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    agents = relationship("AIAgent", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class AIAgent(Base):
    __tablename__ = "ai_agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'white_collar', 'specialist', 'generalist'
    role = Column(String, nullable=False)
    capabilities = Column(Text, nullable=False)  # JSON string
    status = Column(String, default="training")  # 'training', 'ready', 'deployed', 'inactive'
    config = Column(Text, nullable=False)  # JSON string
    performance = Column(Text, nullable=False)  # JSON string
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="agents")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="agent")
    tool_executions = relationship("ToolExecution", back_populates="agent")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("ai_agents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    messages = Column(Text, nullable=False)  # JSON string
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    agent = relationship("AIAgent", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    tool_executions = relationship("ToolExecution", back_populates="conversation")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    agent_id = Column(String, ForeignKey("ai_agents.id"), nullable=True)
    event_type = Column(String, nullable=False)  # 'agent_created', 'agent_tested', 'agent_deployed', etc.
    event_data = Column(Text, nullable=False)  # JSON string
    metrics = Column(Text, nullable=False)  # JSON string
    processing_time = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="analytics")
    agent = relationship("AIAgent", back_populates="analytics")

class ToolExecution(Base):
    __tablename__ = "tool_executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_name = Column(String, nullable=False)
    parameters = Column(Text, nullable=False)  # JSON string
    result = Column(Text, nullable=False)  # JSON string
    success = Column(Boolean, nullable=False)
    processing_time = Column(Integer, nullable=False)
    error = Column(Text, nullable=True)
    agent_id = Column(String, ForeignKey("ai_agents.id"), nullable=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=True)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    agent = relationship("AIAgent", back_populates="tool_executions")
    conversation = relationship("Conversation", back_populates="tool_executions")

# Legacy model (can be removed if not needed)
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    published = Column(Boolean, default=False)
    author_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())