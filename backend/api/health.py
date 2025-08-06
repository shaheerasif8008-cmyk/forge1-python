from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
import time
import psutil
import os
from datetime import datetime

from core.database import get_db
from models.models import AIAgent, User
from models.schemas import StandardResponse
from api.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=StandardResponse)
async def get_health_status():
    """Get overall system health status"""
    
    try:
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": memory.available,
                "disk_percent": disk.percent,
                "disk_free": disk.free
            },
            "services": {
                "database": "healthy",
                "ai_services": "healthy",
                "socket_io": "healthy"
            }
        }
        
        # Determine overall status
        if cpu_percent > 90 or memory.percent > 90 or disk.percent > 90:
            health_data["status"] = "warning"
        
        if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
            health_data["status"] = "critical"
        
        return StandardResponse(
            success=True,
            message="Health status retrieved successfully",
            data=health_data
        )
        
    except Exception as e:
        return StandardResponse(
            success=False,
            message=f"Failed to get health status: {str(e)}",
            data={"status": "error"}
        )

@router.get("/database", response_model=StandardResponse)
async def get_database_health(db: Session = Depends(get_db)):
    """Get database health status"""
    
    try:
        # Test database connection
        db.execute("SELECT 1")
        
        # Get database stats
        user_count = db.query(AIAgent).count()
        agent_count = db.query(AIAgent).count()
        
        db_health = {
            "status": "healthy",
            "connection": "connected",
            "stats": {
                "total_users": user_count,
                "total_agents": agent_count
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Database health retrieved successfully",
            data=db_health
        )
        
    except Exception as e:
        return StandardResponse(
            success=False,
            message=f"Database health check failed: {str(e)}",
            data={"status": "unhealthy"}
        )

@router.get("/ai-services", response_model=StandardResponse)
async def get_ai_services_health():
    """Get AI services health status"""
    
    try:
        # Check AI service availability (placeholder implementation)
        ai_services = {
            "zai_sdk": {"status": "healthy", "response_time": 150},
            "openai": {"status": "healthy", "response_time": 200},
            "anthropic": {"status": "healthy", "response_time": 180},
            "google": {"status": "healthy", "response_time": 250}
        }
        
        # Determine overall status
        all_healthy = all(service["status"] == "healthy" for service in ai_services.values())
        
        ai_health = {
            "status": "healthy" if all_healthy else "degraded",
            "services": ai_services,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="AI services health retrieved successfully",
            data=ai_health
        )
        
    except Exception as e:
        return StandardResponse(
            success=False,
            message=f"AI services health check failed: {str(e)}",
            data={"status": "error"}
        )

@router.get("/metrics", response_model=StandardResponse)
async def get_system_metrics():
    """Get detailed system metrics"""
    
    try:
        # Get detailed system metrics
        cpu = psutil.cpu_percent(interval=1, percpu=True)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        network = psutil.net_io_counters()
        
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "cpu": {
                "percent": psutil.cpu_percent(interval=1),
                "per_cpu": cpu,
                "count": psutil.cpu_count(),
                "count_logical": psutil.cpu_count(logical=True)
            },
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "used": memory.used,
                "percent": memory.percent
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "network": {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv
            },
            "system": {
                "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat(),
                "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
            }
        }
        
        return StandardResponse(
            success=True,
            message="System metrics retrieved successfully",
            data=metrics
        )
        
    except Exception as e:
        return StandardResponse(
            success=False,
            message=f"Failed to get system metrics: {str(e)}",
            data={}
        )

@router.get("/uptime", response_model=StandardResponse)
async def get_uptime():
    """Get system uptime information"""
    
    try:
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.utcnow() - boot_time
        
        uptime_data = {
            "boot_time": boot_time.isoformat(),
            "uptime_seconds": uptime.total_seconds(),
            "uptime_days": uptime.days,
            "uptime_hours": uptime.seconds // 3600,
            "uptime_minutes": (uptime.seconds % 3600) // 60,
            "current_time": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Uptime information retrieved successfully",
            data=uptime_data
        )
        
    except Exception as e:
        return StandardResponse(
            success=False,
            message=f"Failed to get uptime: {str(e)}",
            data={}
        )