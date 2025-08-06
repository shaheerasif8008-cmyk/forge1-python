from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json
import time
import asyncio
from datetime import datetime

from core.database import get_db
from models.models import AIAgent, User
from models.schemas import (
    MultiLLMRequest, MultiLLMResponse, LLMModel, MultiLLMConfig, StandardResponse
)
from api.auth import get_current_active_user

router = APIRouter()

# Import AI services (these would be implemented in services/)
try:
    from services.ai_service import AIService
    from services.multi_llm_service import MultiLLMService
    from services.emotional_service import EmotionalService
    from services.multimodal_service import MultimodalService
except ImportError:
    # Placeholder implementations
    class AIService:
        async def chat_completion(self, messages, model, **kwargs):
            return {"content": f"Response from {model}", "usage": {"total_tokens": 100}}
    
    class MultiLLMService:
        async def orchestrate(self, request):
            return {
                "response": "Multi-LLM orchestrated response",
                "model_used": "gpt-4o",
                "processing_time": 1.5,
                "token_usage": {"total_tokens": 150},
                "confidence": 0.95
            }
    
    class EmotionalService:
        async def analyze_emotion(self, text):
            return {
                "emotion": "neutral",
                "confidence": 0.8,
                "sentiment": "positive"
            }
    
    class MultimodalService:
        async def process_image(self, image_data):
            return {"description": "Image processed successfully"}

# Initialize services
ai_service = AIService()
multi_llm_service = MultiLLMService()
emotional_service = EmotionalService()
multimodal_service = MultimodalService()

@router.post("/multimodal", response_model=StandardResponse)
async def process_multimodal(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process multimodal inputs (text, images, audio)"""
    
    try:
        input_type = request.get("type", "text")
        data = request.get("data", {})
        
        result = {}
        
        if input_type == "text":
            # Process text with emotional intelligence
            emotion_result = await emotional_service.analyze_emotion(data.get("text", ""))
            result["emotion"] = emotion_result
            
            # Generate response
            llm_response = await ai_service.chat_completion(
                messages=[{"role": "user", "content": data.get("text", "")}],
                model="gpt-4o"
            )
            result["response"] = llm_response
            
        elif input_type == "image":
            # Process image
            image_result = await multimodal_service.process_image(data)
            result["image_analysis"] = image_result
            
        elif input_type == "audio":
            # Process audio (placeholder)
            result["audio_analysis"] = {"status": "Audio processing not yet implemented"}
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported input type"
            )
        
        result["processing_time"] = time.time()
        result["input_type"] = input_type
        
        return StandardResponse(
            success=True,
            message="Multimodal processing completed successfully",
            data=result
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multimodal processing failed: {str(e)}"
        )

@router.post("/multi-llm", response_model=StandardResponse)
async def multi_llm_orchestration(
    request: MultiLLMRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Orchestrate multiple LLMs for enhanced responses"""
    
    try:
        result = await multi_llm_service.orchestrate(request)
        
        return StandardResponse(
            success=True,
            message="Multi-LLM orchestration completed successfully",
            data=result
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-LLM orchestration failed: {str(e)}"
        )

@router.post("/emotional-intelligence", response_model=StandardResponse)
async def emotional_intelligence(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process request with emotional intelligence"""
    
    try:
        text = request.get("text", "")
        context = request.get("context", {})
        
        # Analyze emotion
        emotion_analysis = await emotional_service.analyze_emotion(text)
        
        # Generate empathetic response
        empathetic_prompt = f"""
        User message: {text}
        Detected emotion: {emotion_analysis.get('emotion', 'neutral')}
        Sentiment: {emotion_analysis.get('sentiment', 'neutral')}
        
        Please respond with empathy and understanding, considering the user's emotional state.
        Context: {context}
        """
        
        response = await ai_service.chat_completion(
            messages=[{"role": "user", "content": empathetic_prompt}],
            model="gpt-4o"
        )
        
        result = {
            "emotion_analysis": emotion_analysis,
            "response": response,
            "empathy_level": "high",
            "processing_time": time.time()
        }
        
        return StandardResponse(
            success=True,
            message="Emotional intelligence processing completed successfully",
            data=result
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emotional intelligence processing failed: {str(e)}"
        )

@router.post("/agent/{agent_id}/chat", response_model=StandardResponse)
async def agent_chat(
    agent_id: str,
    request: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Chat with a specific AI agent"""
    
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
        message = request.get("message", "")
        context = request.get("context", {})
        
        # Get agent configuration
        agent_config = json.loads(agent.config)
        
        # Determine which model to use based on agent config
        llm_config = agent_config.get("llm_blend", {})
        primary_model = llm_config.get("primary_model", "gpt-4o")
        
        # Add emotional intelligence if enabled
        if agent_config.get("emotional_intelligence", True):
            emotion_analysis = await emotional_service.analyze_emotion(message)
            context["emotion"] = emotion_analysis
        
        # Generate response
        response = await ai_service.chat_completion(
            messages=[{"role": "user", "content": message}],
            model=primary_model,
            temperature=agent_config.get("temperature", 0.7),
            max_tokens=agent_config.get("max_tokens", 2000)
        )
        
        result = {
            "agent_id": agent_id,
            "agent_name": agent.name,
            "message": message,
            "response": response,
            "context": context,
            "model_used": primary_model,
            "processing_time": time.time()
        }
        
        return StandardResponse(
            success=True,
            message="Agent chat completed successfully",
            data=result
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent chat failed: {str(e)}"
        )

@router.get("/models", response_model=StandardResponse)
async def get_available_models(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of available AI models"""
    
    models = [
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
        },
        {
            "id": "gemini-flash-2.5",
            "name": "Gemini Flash 2.5",
            "provider": "Google",
            "capabilities": ["text", "multimodal", "code"],
            "max_tokens": 1000000,
            "cost_per_1k_tokens": 0.005
        },
        {
            "id": "gpt-4-turbo",
            "name": "GPT-4 Turbo",
            "provider": "OpenAI",
            "capabilities": ["text", "code", "reasoning"],
            "max_tokens": 128000,
            "cost_per_1k_tokens": 0.008
        },
        {
            "id": "claude-3-sonnet",
            "name": "Claude 3 Sonnet",
            "provider": "Anthropic",
            "capabilities": ["text", "reasoning"],
            "max_tokens": 200000,
            "cost_per_1k_tokens": 0.003
        }
    ]
    
    return StandardResponse(
        success=True,
        message="Available models retrieved successfully",
        data=models
    )

@router.post("/test-agent", response_model=StandardResponse)
async def test_agent_performance(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test agent performance with various scenarios"""
    
    agent_id = request.get("agent_id")
    test_type = request.get("test_type", "basic")
    
    if not agent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent ID is required"
        )
    
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
        test_results = {
            "agent_id": agent_id,
            "agent_name": agent.name,
            "test_type": test_type,
            "timestamp": datetime.utcnow().isoformat(),
            "results": []
        }
        
        # Define test scenarios based on test type
        if test_type == "basic":
            test_scenarios = [
                {"name": "Greeting", "message": "Hello, how are you?"},
                {"name": "Question", "message": "What is the capital of France?"},
                {"name": "Code", "message": "Write a Python function to calculate factorial"},
                {"name": "Creative", "message": "Write a short poem about AI"}
            ]
        elif test_type == "stress":
            test_scenarios = [
                {"name": "Complex Query", "message": "Explain quantum computing in simple terms"},
                {"name": "Multi-step", "message": "Plan a 7-day trip to Japan including budget"},
                {"name": "Technical", "message": "Debug this Python code: def broken_func(x): return x/0"}
            ]
        else:
            test_scenarios = [{"name": "Custom", "message": request.get("custom_message", "Test message")}]
        
        # Run tests
        for scenario in test_scenarios:
            start_time = time.time()
            
            try:
                response = await ai_service.chat_completion(
                    messages=[{"role": "user", "content": scenario["message"]}],
                    model="gpt-4o"
                )
                
                processing_time = time.time() - start_time
                
                test_result = {
                    "scenario": scenario["name"],
                    "message": scenario["message"],
                    "success": True,
                    "response_length": len(response.get("content", "")),
                    "processing_time": processing_time,
                    "token_usage": response.get("usage", {})
                }
                
            except Exception as e:
                test_result = {
                    "scenario": scenario["name"],
                    "message": scenario["message"],
                    "success": False,
                    "error": str(e),
                    "processing_time": time.time() - start_time
                }
            
            test_results["results"].append(test_result)
        
        # Calculate overall metrics
        successful_tests = sum(1 for r in test_results["results"] if r["success"])
        avg_processing_time = sum(r.get("processing_time", 0) for r in test_results["results"]) / len(test_results["results"])
        
        test_results["summary"] = {
            "total_tests": len(test_results["results"]),
            "successful_tests": successful_tests,
            "success_rate": (successful_tests / len(test_results["results"])) * 100,
            "average_processing_time": avg_processing_time
        }
        
        return StandardResponse(
            success=True,
            message="Agent test completed successfully",
            data=test_results
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent test failed: {str(e)}"
        )