from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
import time
from datetime import datetime

from core.database import get_db
from models.models import ToolExecution, AIAgent, Conversation, User
from models.schemas import (
    ToolExecutionCreate, ToolExecutionResponse, StandardResponse
)
from api.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=StandardResponse)
async def create_tool_execution(
    execution: ToolExecutionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify agent exists and belongs to user if agent_id is provided
    if execution.agent_id:
        agent = db.query(AIAgent).filter(
            AIAgent.id == execution.agent_id,
            AIAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    
    # Verify conversation exists and belongs to user if conversation_id is provided
    if execution.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == execution.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    
    try:
        # Execute the tool (this is a placeholder - actual tool execution would be here)
        start_time = time.time()
        
        # Simulate tool execution
        result = {
            "status": "success",
            "output": f"Tool {execution.tool_name} executed successfully",
            "data": execution.parameters
        }
        
        processing_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        
        db_execution = ToolExecution(
            tool_name=execution.tool_name,
            parameters=json.dumps(execution.parameters),
            result=json.dumps(result),
            success=True,
            processing_time=processing_time,
            agent_id=execution.agent_id,
            conversation_id=execution.conversation_id
        )
        
        db.add(db_execution)
        db.commit()
        db.refresh(db_execution)
        
        response_execution = ToolExecutionResponse(
            id=db_execution.id,
            tool_name=db_execution.tool_name,
            parameters=json.loads(db_execution.parameters),
            result=json.loads(db_execution.result),
            success=db_execution.success,
            processing_time=db_execution.processing_time,
            error=db_execution.error,
            agent_id=db_execution.agent_id,
            conversation_id=db_execution.conversation_id,
            timestamp=db_execution.timestamp
        )
        
        return StandardResponse(
            success=True,
            message="Tool execution recorded successfully",
            data=response_execution
        )
        
    except Exception as e:
        # Record failed execution
        try:
            processing_time = int((time.time() - start_time) * 1000)
            db_execution = ToolExecution(
                tool_name=execution.tool_name,
                parameters=json.dumps(execution.parameters),
                result=json.dumps({"error": str(e)}),
                success=False,
                processing_time=processing_time,
                error=str(e),
                agent_id=execution.agent_id,
                conversation_id=execution.conversation_id
            )
            
            db.add(db_execution)
            db.commit()
            
        except Exception:
            db.rollback()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute tool: {str(e)}"
        )

@router.get("/", response_model=List[ToolExecutionResponse])
async def get_tool_executions(
    agent_id: str = None,
    conversation_id: str = None,
    tool_name: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(ToolExecution)
    
    # Filter by user ownership
    if agent_id:
        # Verify agent belongs to user
        agent = db.query(AIAgent).filter(
            AIAgent.id == agent_id,
            AIAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        query = query.filter(ToolExecution.agent_id == agent_id)
    
    if conversation_id:
        # Verify conversation belongs to user
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        query = query.filter(ToolExecution.conversation_id == conversation_id)
    
    if tool_name:
        query = query.filter(ToolExecution.tool_name == tool_name)
    
    executions = query.order_by(ToolExecution.timestamp.desc()).offset(skip).limit(limit).all()
    
    response_executions = []
    for execution in executions:
        response_execution = ToolExecutionResponse(
            id=execution.id,
            tool_name=execution.tool_name,
            parameters=json.loads(execution.parameters),
            result=json.loads(execution.result),
            success=execution.success,
            processing_time=execution.processing_time,
            error=execution.error,
            agent_id=execution.agent_id,
            conversation_id=execution.conversation_id,
            timestamp=execution.timestamp
        )
        response_executions.append(response_execution)
    
    return response_executions

@router.get("/tools", response_model=StandardResponse)
async def get_available_tools(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of available tools that can be executed"""
    
    available_tools = [
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "query": {"type": "string", "required": True, "description": "Search query"},
                "num_results": {"type": "integer", "required": False, "default": 10, "description": "Number of results"}
            }
        },
        {
            "name": "file_read",
            "description": "Read a file from the system",
            "parameters": {
                "file_path": {"type": "string", "required": True, "description": "Path to the file"}
            }
        },
        {
            "name": "file_write",
            "description": "Write content to a file",
            "parameters": {
                "file_path": {"type": "string", "required": True, "description": "Path to the file"},
                "content": {"type": "string", "required": True, "description": "Content to write"},
                "mode": {"type": "string", "required": False, "default": "write", "description": "Write mode (write/append)"}
            }
        },
        {
            "name": "code_execute",
            "description": "Execute code in a safe environment",
            "parameters": {
                "code": {"type": "string", "required": True, "description": "Code to execute"},
                "language": {"type": "string", "required": False, "default": "python", "description": "Programming language"}
            }
        },
        {
            "name": "database_query",
            "description": "Execute database queries",
            "parameters": {
                "query": {"type": "string", "required": True, "description": "SQL query"},
                "params": {"type": "object", "required": False, "description": "Query parameters"}
            }
        },
        {
            "name": "api_call",
            "description": "Make HTTP API calls",
            "parameters": {
                "url": {"type": "string", "required": True, "description": "API URL"},
                "method": {"type": "string", "required": False, "default": "GET", "description": "HTTP method"},
                "headers": {"type": "object", "required": False, "description": "Request headers"},
                "body": {"type": "object", "required": False, "description": "Request body"}
            }
        }
    ]
    
    return StandardResponse(
        success=True,
        message="Available tools retrieved successfully",
        data=available_tools
    )

@router.get("/stats", response_model=StandardResponse)
async def get_tool_execution_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics about tool executions"""
    
    try:
        # Get all tool executions for user's agents
        user_agents = db.query(AIAgent).filter(AIAgent.user_id == current_user.id).all()
        agent_ids = [agent.id for agent in user_agents]
        
        if not agent_ids:
            return StandardResponse(
                success=True,
                message="No tool execution stats available",
                data={"total_executions": 0, "tool_usage": {}, "success_rate": 0}
            )
        
        executions = db.query(ToolExecution).filter(
            ToolExecution.agent_id.in_(agent_ids)
        ).all()
        
        total_executions = len(executions)
        successful_executions = sum(1 for e in executions if e.success)
        
        # Tool usage statistics
        tool_usage = {}
        for execution in executions:
            tool_usage[execution.tool_name] = tool_usage.get(execution.tool_name, 0) + 1
        
        # Average processing time
        avg_processing_time = sum(
            e.processing_time for e in executions
        ) / total_executions if total_executions > 0 else 0
        
        stats_data = {
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "success_rate": (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            "average_processing_time": avg_processing_time,
            "tool_usage": tool_usage,
            "recent_executions": [
                {
                    "id": e.id,
                    "tool_name": e.tool_name,
                    "success": e.success,
                    "processing_time": e.processing_time,
                    "timestamp": e.timestamp
                }
                for e in executions[:10]  # Last 10 executions
            ]
        }
        
        return StandardResponse(
            success=True,
            message="Tool execution statistics retrieved successfully",
            data=stats_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool execution stats: {str(e)}"
        )