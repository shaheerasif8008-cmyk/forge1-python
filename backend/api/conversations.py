from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from core.database import get_db
from models.models import Conversation, AIAgent, User
from models.schemas import (
    ConversationCreate, ConversationResponse, Message, StandardResponse
)
from api.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=StandardResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify agent exists and belongs to user
    agent = db.query(AIAgent).filter(
        AIAgent.id == conversation.agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        # Convert messages to JSON
        messages_json = json.dumps([msg.dict() for msg in conversation.messages])
        
        db_conversation = Conversation(
            agent_id=conversation.agent_id,
            user_id=current_user.id,
            messages=messages_json,
            title=conversation.title
        )
        
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        
        # Convert back to response format
        response_messages = [Message(**msg) for msg in json.loads(db_conversation.messages)]
        
        response_conversation = ConversationResponse(
            id=db_conversation.id,
            agent_id=db_conversation.agent_id,
            user_id=db_conversation.user_id,
            messages=response_messages,
            title=db_conversation.title,
            created_at=db_conversation.created_at,
            updated_at=db_conversation.updated_at
        )
        
        return StandardResponse(
            success=True,
            message="Conversation created successfully",
            data=response_conversation
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )

@router.get("/", response_model=List[ConversationResponse])
async def get_conversations(
    agent_id: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    
    conversations = query.offset(skip).limit(limit).all()
    
    response_conversations = []
    for conv in conversations:
        response_messages = [Message(**msg) for msg in json.loads(conv.messages)]
        
        response_conversation = ConversationResponse(
            id=conv.id,
            agent_id=conv.agent_id,
            user_id=conv.user_id,
            messages=response_messages,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        )
        response_conversations.append(response_conversation)
    
    return response_conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    response_messages = [Message(**msg) for msg in json.loads(conversation.messages)]
    
    return ConversationResponse(
        id=conversation.id,
        agent_id=conversation.agent_id,
        user_id=conversation.user_id,
        messages=response_messages,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )

@router.post("/{conversation_id}/message", response_model=StandardResponse)
async def add_message(
    conversation_id: str,
    message: Message,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    try:
        # Add new message to conversation
        current_messages = json.loads(conversation.messages)
        current_messages.append(message.dict())
        
        conversation.messages = json.dumps(current_messages)
        conversation.updated_at = datetime.utcnow()
        
        # Update title if it's the first message
        if not conversation.title and message.role == "user":
            conversation.title = message.content[:50] + "..." if len(message.content) > 50 else message.content
        
        db.commit()
        db.refresh(conversation)
        
        return StandardResponse(
            success=True,
            message="Message added successfully",
            data={"conversation_id": conversation.id, "message_count": len(current_messages)}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add message: {str(e)}"
        )

@router.delete("/{conversation_id}", response_model=StandardResponse)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    try:
        db.delete(conversation)
        db.commit()
        
        return StandardResponse(
            success=True,
            message="Conversation deleted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )