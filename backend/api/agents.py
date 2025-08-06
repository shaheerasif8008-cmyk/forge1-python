from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from core.database import get_db
from models.models import AIAgent, User
from models.schemas import (
    AIAgentCreate, AIAgentUpdate, AIAgentResponse, 
    AgentConfig, AgentPerformance, StandardResponse
)
from api.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=StandardResponse)
async def create_agent(
    agent: AIAgentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # Convert Pydantic models to JSON strings for database storage
        config_json = json.dumps(agent.config.dict())
        performance_json = json.dumps(agent.performance.dict())
        capabilities_json = json.dumps(agent.capabilities)
        
        db_agent = AIAgent(
            name=agent.name,
            type=agent.type.value,
            role=agent.role,
            capabilities=capabilities_json,
            config=config_json,
            performance=performance_json,
            user_id=current_user.id,
            status="training"
        )
        
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        
        # Convert back to response format
        response_agent = AIAgentResponse(
            id=db_agent.id,
            name=db_agent.name,
            type=db_agent.type,
            role=db_agent.role,
            status=db_agent.status,
            capabilities=json.loads(db_agent.capabilities),
            config=AgentConfig(**json.loads(db_agent.config)),
            performance=AgentPerformance(**json.loads(db_agent.performance)),
            user_id=db_agent.user_id,
            created_at=db_agent.created_at,
            updated_at=db_agent.updated_at
        )
        
        return StandardResponse(
            success=True,
            message="AI Agent created successfully",
            data=response_agent
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )

@router.get("/", response_model=List[AIAgentResponse])
async def get_agents(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(AIAgent).filter(AIAgent.user_id == current_user.id)
    
    if status:
        query = query.filter(AIAgent.status == status)
    
    agents = query.offset(skip).limit(limit).all()
    
    response_agents = []
    for agent in agents:
        response_agent = AIAgentResponse(
            id=agent.id,
            name=agent.name,
            type=agent.type,
            role=agent.role,
            status=agent.status,
            capabilities=json.loads(agent.capabilities),
            config=AgentConfig(**json.loads(agent.config)),
            performance=AgentPerformance(**json.loads(agent.performance)),
            user_id=agent.user_id,
            created_at=agent.created_at,
            updated_at=agent.updated_at
        )
        response_agents.append(response_agent)
    
    return response_agents

@router.get("/{agent_id}", response_model=AIAgentResponse)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AIAgent).filter(
        AIAgent.id == agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    return AIAgentResponse(
        id=agent.id,
        name=agent.name,
        type=agent.type,
        role=agent.role,
        status=agent.status,
        capabilities=json.loads(agent.capabilities),
        config=AgentConfig(**json.loads(agent.config)),
        performance=AgentPerformance(**json.loads(agent.performance)),
        user_id=agent.user_id,
        created_at=agent.created_at,
        updated_at=agent.updated_at
    )

@router.put("/{agent_id}", response_model=StandardResponse)
async def update_agent(
    agent_id: str,
    agent_update: AIAgentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AIAgent).filter(
        AIAgent.id == agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        # Update fields
        if agent_update.name:
            agent.name = agent_update.name
        if agent_update.role:
            agent.role = agent_update.role
        if agent_update.capabilities:
            agent.capabilities = json.dumps(agent_update.capabilities)
        if agent_update.config:
            agent.config = json.dumps(agent_update.config.dict())
        if agent_update.status:
            agent.status = agent_update.status.value
        
        agent.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(agent)
        
        return StandardResponse(
            success=True,
            message="Agent updated successfully",
            data={"agent_id": agent.id}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update agent: {str(e)}"
        )

@router.delete("/{agent_id}", response_model=StandardResponse)
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AIAgent).filter(
        AIAgent.id == agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        db.delete(agent)
        db.commit()
        
        return StandardResponse(
            success=True,
            message="Agent deleted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete agent: {str(e)}"
        )

@router.post("/{agent_id}/deploy", response_model=StandardResponse)
async def deploy_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AIAgent).filter(
        AIAgent.id == agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        agent.status = "deployed"
        agent.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(agent)
        
        return StandardResponse(
            success=True,
            message="Agent deployed successfully",
            data={"agent_id": agent.id, "status": agent.status}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deploy agent: {str(e)}"
        )

@router.post("/{agent_id}/test", response_model=StandardResponse)
async def test_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AIAgent).filter(
        AIAgent.id == agent_id,
        AIAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Here you would implement actual agent testing logic
    # For now, we'll just update the status
    try:
        agent.status = "ready"
        agent.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(agent)
        
        return StandardResponse(
            success=True,
            message="Agent test completed successfully",
            data={"agent_id": agent.id, "status": agent.status}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to test agent: {str(e)}"
        )