import asyncio
import time
from typing import Dict, Any, List, Optional
import json
import httpx
from datetime import datetime

from core.config import settings

class AIService:
    """Core AI service for interacting with various LLM providers"""
    
    def __init__(self):
        self.clients = {
            "openai": None,
            "anthropic": None,
            "google": None,
            "zai": None
        }
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize HTTP clients for different AI providers"""
        timeout = httpx.Timeout(30.0, connect=10.0)
        
        if settings.openai_api_key:
            self.clients["openai"] = httpx.Client(
                base_url="https://api.openai.com/v1",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                timeout=timeout
            )
        
        if settings.anthropic_api_key:
            self.clients["anthropic"] = httpx.Client(
                base_url="https://api.anthropic.com",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01"
                },
                timeout=timeout
            )
        
        if settings.google_api_key:
            self.clients["google"] = httpx.Client(
                base_url="https://generativelanguage.googleapis.com/v1beta",
                timeout=timeout
            )
        
        if settings.zai_api_key:
            self.clients["zai"] = httpx.Client(
                base_url="https://api.z-ai.com/v1",
                headers={"Authorization": f"Bearer {settings.zai_api_key}"},
                timeout=timeout
            )
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate chat completion using specified model
        """
        
        start_time = time.time()
        
        try:
            if model.startswith("gpt"):
                return await self._openai_chat_completion(
                    messages, model, temperature, max_tokens, **kwargs
                )
            elif model.startswith("claude"):
                return await self._anthropic_chat_completion(
                    messages, model, temperature, max_tokens, **kwargs
                )
            elif model.startswith("gemini"):
                return await self._google_chat_completion(
                    messages, model, temperature, max_tokens, **kwargs
                )
            else:
                # Default to ZAI SDK
                return await self._zai_chat_completion(
                    messages, model, temperature, max_tokens, **kwargs
                )
        
        except Exception as e:
            return {
                "content": f"Error: {str(e)}",
                "usage": {"total_tokens": 0},
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def _openai_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> Dict[str, Any]:
        """OpenAI chat completion"""
        
        if not self.clients["openai"]:
            raise Exception("OpenAI client not initialized")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            **kwargs
        }
        
        response = self.clients["openai"].post("/chat/completions", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage", {}),
            "model": model,
            "provider": "openai"
        }
    
    async def _anthropic_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> Dict[str, Any]:
        """Anthropic chat completion"""
        
        if not self.clients["anthropic"]:
            raise Exception("Anthropic client not initialized")
        
        # Convert messages to Anthropic format
        anthropic_messages = []
        for msg in messages:
            if msg["role"] == "user":
                anthropic_messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                anthropic_messages.append({"role": "assistant", "content": msg["content"]})
        
        payload = {
            "model": model,
            "messages": anthropic_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs
        }
        
        response = self.clients["anthropic"].post("/messages", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "content": data["content"][0]["text"],
            "usage": data.get("usage", {}),
            "model": model,
            "provider": "anthropic"
        }
    
    async def _google_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> Dict[str, Any]:
        """Google Gemini chat completion"""
        
        if not self.clients["google"]:
            raise Exception("Google client not initialized")
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                **kwargs
            }
        }
        
        response = self.clients["google"].post(
            f"/models/{model}:generateContent",
            params={"key": settings.google_api_key},
            json=payload
        )
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "content": data["candidates"][0]["content"]["parts"][0]["text"],
            "usage": data.get("usageMetadata", {}),
            "model": model,
            "provider": "google"
        }
    
    async def _zai_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> Dict[str, Any]:
        """ZAI SDK chat completion"""
        
        if not self.clients["zai"]:
            # Fallback response
            return {
                "content": "ZAI SDK client not initialized. Please configure API keys.",
                "usage": {"total_tokens": 50},
                "model": model,
                "provider": "zai"
            }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            **kwargs
        }
        
        response = self.clients["zai"].post("/chat/completions", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage", {}),
            "model": model,
            "provider": "zai"
        }
    
    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        model: str = "dall-e-3"
    ) -> Dict[str, Any]:
        """Generate image using AI"""
        
        if not self.clients["openai"]:
            raise Exception("OpenAI client not initialized")
        
        payload = {
            "model": model,
            "prompt": prompt,
            "size": size,
            "n": 1
        }
        
        response = self.clients["openai"].post("/images/generations", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "image_url": data["data"][0]["url"],
            "revised_prompt": data["data"][0].get("revised_prompt", prompt),
            "model": model,
            "size": size
        }
    
    async def analyze_image(
        self,
        image_url: str,
        prompt: str = "Describe this image in detail."
    ) -> Dict[str, Any]:
        """Analyze image using AI vision"""
        
        if not self.clients["openai"]:
            raise Exception("OpenAI client not initialized")
        
        payload = {
            "model": "gpt-4-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "max_tokens": 500
        }
        
        response = self.clients["openai"].post("/chat/completions", json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "analysis": data["choices"][0]["message"]["content"],
            "usage": data.get("usage", {}),
            "model": "gpt-4-vision-preview"
        }
    
    async def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        
        model_info = {
            "gpt-4o": {
                "provider": "OpenAI",
                "max_tokens": 128000,
                "capabilities": ["text", "vision", "code", "reasoning"],
                "training_data": "October 2023"
            },
            "claude-opus-4": {
                "provider": "Anthropic",
                "max_tokens": 200000,
                "capabilities": ["text", "reasoning", "analysis"],
                "training_data": "Early 2024"
            },
            "gemini-flash-2.5": {
                "provider": "Google",
                "max_tokens": 1000000,
                "capabilities": ["text", "vision", "code", "multimodal"],
                "training_data": "Early 2024"
            }
        }
        
        return model_info.get(model, {"error": "Model not found"})

# Global AI service instance
ai_service = AIService()