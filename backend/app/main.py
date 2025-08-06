from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import socketio
import json
from typing import List

from core.config import settings
from core.database import create_tables
from api.auth import auth_router
from api.agents import agents_router
from api.conversations import conversations_router
from api.analytics import analytics_router
from api.tools import tools_router
from api.forge1 import forge1_router
from api.health import health_router

# Initialize Socket.IO
sio = socketio.AsyncServer(
    cors_allowed_origins=settings.backend_cors_origins,
    async_mode='asgi'
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    print(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    yield
    # Shutdown
    print(f"🛑 {settings.app_name} shutting down...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready AI employee generator platform",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include API routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(agents_router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(conversations_router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(tools_router, prefix="/api/tools", tags=["Tools"])
app.include_router(forge1_router, prefix="/api/forge1", tags=["Forge 1"])
app.include_router(health_router, prefix="/api/health", tags=["Health"])

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit('connection_established', {'message': 'Connected to Forge 1'}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_agent_room(sid, data):
    agent_id = data.get('agent_id')
    if agent_id:
        await sio.enter_room(sid, f'agent_{agent_id}')
        await sio.emit('joined_room', {'room': f'agent_{agent_id}'}, to=sid)

@sio.event
async def leave_agent_room(sid, data):
    agent_id = data.get('agent_id')
    if agent_id:
        await sio.leave_room(sid, f'agent_{agent_id}')
        await sio.emit('left_room', {'room': f'agent_{agent_id}'}, to=sid)

# Mount Socket.IO
app.mount("/socket.io", socketio.ASGIApp(sio))

# Serve static files (for production)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "status": "operational"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )