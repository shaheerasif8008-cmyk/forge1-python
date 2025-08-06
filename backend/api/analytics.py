from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
from datetime import datetime, timedelta

from core.database import get_db
from models.models import Analytics, AIAgent, User
from models.schemas import (
    AnalyticsCreate, AnalyticsResponse, StandardResponse, EventType
)
from api.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=StandardResponse)
async def create_analytics(
    analytics: AnalyticsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify agent exists and belongs to user if agent_id is provided
    if analytics.agent_id:
        agent = db.query(AIAgent).filter(
            AIAgent.id == analytics.agent_id,
            AIAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    
    try:
        db_analytics = Analytics(
            user_id=analytics.user_id or current_user.id,
            agent_id=analytics.agent_id,
            event_type=analytics.event_type.value,
            event_data=json.dumps(analytics.event_data),
            metrics=json.dumps(analytics.metrics),
            processing_time=analytics.processing_time
        )
        
        db.add(db_analytics)
        db.commit()
        db.refresh(db_analytics)
        
        return StandardResponse(
            success=True,
            message="Analytics event recorded successfully",
            data={"analytics_id": db_analytics.id}
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create analytics: {str(e)}"
        )

@router.get("/", response_model=List[AnalyticsResponse])
async def get_analytics(
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Analytics).filter(Analytics.user_id == current_user.id)
    
    if event_type:
        query = query.filter(Analytics.event_type == event_type.value)
    
    if agent_id:
        query = query.filter(Analytics.agent_id == agent_id)
    
    if start_date:
        query = query.filter(Analytics.timestamp >= start_date)
    
    if end_date:
        query = query.filter(Analytics.timestamp <= end_date)
    
    analytics_events = query.order_by(Analytics.timestamp.desc()).offset(skip).limit(limit).all()
    
    response_analytics = []
    for event in analytics_events:
        response_event = AnalyticsResponse(
            id=event.id,
            user_id=event.user_id,
            agent_id=event.agent_id,
            event_type=event.event_type,
            event_data=json.loads(event.event_data),
            metrics=json.loads(event.metrics),
            processing_time=event.processing_time,
            timestamp=event.timestamp
        )
        response_analytics.append(response_event)
    
    return response_analytics

@router.get("/dashboard", response_model=StandardResponse)
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # Get basic counts
        total_agents = db.query(AIAgent).filter(AIAgent.user_id == current_user.id).count()
        
        # Get agent status distribution
        agent_status_counts = db.query(
            AIAgent.status,
            func.count(AIAgent.id).label('count')
        ).filter(AIAgent.user_id == current_user.id).group_by(AIAgent.status).all()
        
        # Get recent events
        recent_events = db.query(Analytics).filter(
            Analytics.user_id == current_user.id
        ).order_by(Analytics.timestamp.desc()).limit(10).all()
        
        # Get event type distribution for last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        event_type_counts = db.query(
            Analytics.event_type,
            func.count(Analytics.id).label('count')
        ).filter(
            Analytics.user_id == current_user.id,
            Analytics.timestamp >= thirty_days_ago
        ).group_by(Analytics.event_type).all()
        
        # Calculate average processing time
        avg_processing_time = db.query(
            func.avg(Analytics.processing_time)
        ).filter(
            Analytics.user_id == current_user.id,
            Analytics.processing_time.isnot(None)
        ).scalar()
        
        dashboard_data = {
            "total_agents": total_agents,
            "agent_status_distribution": {
                status: count for status, count in agent_status_counts
            },
            "recent_events": [
                {
                    "id": event.id,
                    "event_type": event.event_type,
                    "timestamp": event.timestamp,
                    "metrics": json.loads(event.metrics)
                }
                for event in recent_events
            ],
            "event_type_distribution": {
                event_type: count for event_type, count in event_type_counts
            },
            "average_processing_time": float(avg_processing_time) if avg_processing_time else 0,
            "period": "last_30_days"
        }
        
        return StandardResponse(
            success=True,
            message="Dashboard analytics retrieved successfully",
            data=dashboard_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard analytics: {str(e)}"
        )

@router.get("/agents/{agent_id}/performance", response_model=StandardResponse)
async def get_agent_performance(
    agent_id: str,
    days: int = Query(30, description="Number of days to analyze"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify agent exists and belongs to user
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
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get analytics for this agent
        analytics_events = db.query(Analytics).filter(
            Analytics.agent_id == agent_id,
            Analytics.timestamp >= start_date
        ).all()
        
        # Calculate performance metrics
        total_events = len(analytics_events)
        successful_events = sum(1 for event in analytics_events 
                              if json.loads(event.metrics).get('success', False))
        
        avg_processing_time = sum(
            event.processing_time for event in analytics_events 
            if event.processing_time
        ) / len([e for e in analytics_events if e.processing_time]) if analytics_events else 0
        
        # Get event types distribution
        event_types = {}
        for event in analytics_events:
            event_types[event.event_type] = event_types.get(event.event_type, 0) + 1
        
        performance_data = {
            "agent_id": agent_id,
            "period_days": days,
            "total_events": total_events,
            "successful_events": successful_events,
            "success_rate": (successful_events / total_events * 100) if total_events > 0 else 0,
            "average_processing_time": avg_processing_time,
            "event_type_distribution": event_types,
            "trend_data": [
                {
                    "date": event.timestamp.strftime('%Y-%m-%d'),
                    "event_type": event.event_type,
                    "processing_time": event.processing_time
                }
                for event in analytics_events
            ]
        }
        
        return StandardResponse(
            success=True,
            message="Agent performance data retrieved successfully",
            data=performance_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent performance: {str(e)}"
        )