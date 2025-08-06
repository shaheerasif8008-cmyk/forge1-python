import asyncio
import time
from typing import Dict, Any, List, Optional
import json
import random
from datetime import datetime

from services.ai_service import ai_service
from models.schemas import MultiLLMRequest, MultiLLMResponse, LLMModel

class MultiLLMService:
    """Service for orchestrating multiple LLMs"""
    
    def __init__(self):
        self.model_strengths = {
            "gpt-4o": ["creativity", "code", "multimodal", "general_knowledge"],
            "claude-opus-4": ["reasoning", "analysis", "long_context", "safety"],
            "gemini-flash-2.5": ["speed", "multimodal", "large_context", "cost_efficiency"],
            "gpt-4-turbo": ["code", "reasoning", "up_to_date"],
            "claude-3-sonnet": ["balance", "speed", "cost_efficiency"]
        }
        
        self.model_costs = {
            "gpt-4o": 0.01,
            "claude-opus-4": 0.015,
            "gemini-flash-2.5": 0.005,
            "gpt-4-turbo": 0.008,
            "claude-3-sonnet": 0.003
        }
    
    async def orchestrate(self, request: MultiLLMRequest) -> MultiLLMResponse:
        """
        Orchestrate multiple LLMs to generate the best response
        """
        
        start_time = time.time()
        
        try:
            # Determine the best routing strategy
            if request.config.routing_strategy == "auto":
                return await self._auto_route(request)
            elif request.config.routing_strategy == "manual":
                return await self._manual_route(request)
            elif request.config.routing_strategy == "load_balance":
                return await self._load_balance(request)
            else:
                # Default to auto routing
                return await self._auto_route(request)
        
        except Exception as e:
            # Fallback to primary model
            fallback_response = await ai_service.chat_completion(
                messages=request.messages,
                model=request.config.primary_model.value,
                temperature=request.config.temperature,
                max_tokens=request.config.max_tokens
            )
            
            return MultiLLMResponse(
                response=fallback_response["content"],
                model_used=request.config.primary_model,
                processing_time=time.time() - start_time,
                token_usage=fallback_response.get("usage", {"total_tokens": 0}),
                confidence=0.7  # Lower confidence due to fallback
            )
    
    async def _auto_route(self, request: MultiLLMRequest) -> MultiLLMResponse:
        """Automatically route to the best model based on content analysis"""
        
        # Analyze the request to determine the best model
        content_analysis = self._analyze_content(request.messages)
        
        # Select the best model based on content analysis
        best_model = self._select_best_model(content_analysis, request.config.primary_model)
        
        # Generate response
        response = await ai_service.chat_completion(
            messages=request.messages,
            model=best_model.value,
            temperature=request.config.temperature,
            max_tokens=request.config.max_tokens
        )
        
        # If confidence is low, try secondary models
        confidence = self._calculate_confidence(content_analysis, best_model)
        
        if confidence < 0.7 and request.config.secondary_models:
            # Get responses from secondary models
            secondary_responses = await self._get_secondary_responses(request, best_model)
            
            # Select the best response
            best_response = self._select_best_response(
                response, secondary_responses, content_analysis
            )
            
            if best_response != response:
                response = best_response
                confidence = 0.8  # Higher confidence after comparison
        
        return MultiLLMResponse(
            response=response["content"],
            model_used=best_model,
            processing_time=time.time() - time.time(),
            token_usage=response.get("usage", {"total_tokens": 0}),
            confidence=confidence
        )
    
    async def _manual_route(self, request: MultiLLMRequest) -> MultiLLMResponse:
        """Use manually specified model weights"""
        
        # Calculate weighted model selection
        models = [request.config.primary_model] + request.config.secondary_models
        weights = request.config.model_weights
        
        if not weights:
            # Equal weights if not specified
            weights = {model: 1.0 for model in models}
        
        # Select model based on weights
        selected_model = self._weighted_random_select(models, weights)
        
        response = await ai_service.chat_completion(
            messages=request.messages,
            model=selected_model.value,
            temperature=request.config.temperature,
            max_tokens=request.config.max_tokens
        )
        
        return MultiLLMResponse(
            response=response["content"],
            model_used=selected_model,
            processing_time=time.time() - time.time(),
            token_usage=response.get("usage", {"total_tokens": 0}),
            confidence=0.8
        )
    
    async def _load_balance(self, request: MultiLLMRequest) -> MultiLLMResponse:
        """Load balance across available models"""
        
        models = [request.config.primary_model] + request.config.secondary_models
        
        # Simple load balancing: round robin based on timestamp
        model_index = int(time.time()) % len(models)
        selected_model = models[model_index]
        
        response = await ai_service.chat_completion(
            messages=request.messages,
            model=selected_model.value,
            temperature=request.config.temperature,
            max_tokens=request.config.max_tokens
        )
        
        return MultiLLMResponse(
            response=response["content"],
            model_used=selected_model,
            processing_time=time.time() - time.time(),
            token_usage=response.get("usage", {"total_tokens": 0}),
            confidence=0.75
        )
    
    def _analyze_content(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Analyze content to determine requirements"""
        
        full_text = " ".join([msg["content"] for msg in messages])
        
        analysis = {
            "length": len(full_text),
            "has_code": "```" in full_text or any(keyword in full_text.lower() for keyword in ["function", "class", "def ", "import "]),
            "has_math": any(char in full_text for char in ["∑", "∫", "√", "π", "∞"]) or "equation" in full_text.lower(),
            "is_creative": any(word in full_text.lower() for word in ["creative", "story", "poem", "imagine", "design"]),
            "is_analytical": any(word in full_text.lower() for word in ["analyze", "compare", "evaluate", "assess"]),
            "is_technical": any(word in full_text.lower() for word in ["technical", "programming", "algorithm", "system"]),
            "requires_vision": any(word in full_text.lower() for word in ["image", "picture", "visual", "diagram"]),
            "requires_long_context": len(full_text) > 4000
        }
        
        return analysis
    
    def _select_best_model(self, analysis: Dict[str, Any], primary_model: LLMModel) -> LLMModel:
        """Select the best model based on content analysis"""
        
        model_scores = {}
        
        for model, strengths in self.model_strengths.items():
            score = 0
            
            # Score based on content requirements
            if analysis["has_code"] and "code" in strengths:
                score += 3
            if analysis["has_math"] and "reasoning" in strengths:
                score += 2
            if analysis["is_creative"] and "creativity" in strengths:
                score += 3
            if analysis["is_analytical"] and "analysis" in strengths:
                score += 3
            if analysis["is_technical"] and "code" in strengths:
                score += 2
            if analysis["requires_vision"] and "multimodal" in strengths:
                score += 4
            if analysis["requires_long_context"] and "long_context" in strengths:
                score += 3
            
            # Prefer primary model if scores are close
            if model == primary_model.value:
                score += 1
            
            model_scores[model] = score
        
        # Select model with highest score
        best_model = max(model_scores, key=model_scores.get)
        
        # Convert to LLMModel enum
        return LLMModel(best_model)
    
    def _calculate_confidence(self, analysis: Dict[str, Any], selected_model: LLMModel) -> float:
        """Calculate confidence in model selection"""
        
        model_strengths = self.model_strengths.get(selected_model.value, [])
        
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on matching strengths
        if analysis["has_code"] and "code" in model_strengths:
            confidence += 0.2
        if analysis["has_math"] and "reasoning" in model_strengths:
            confidence += 0.15
        if analysis["is_creative"] and "creativity" in model_strengths:
            confidence += 0.2
        if analysis["requires_vision"] and "multimodal" in model_strengths:
            confidence += 0.25
        if analysis["requires_long_context"] and "long_context" in model_strengths:
            confidence += 0.15
        
        return min(confidence, 1.0)
    
    async def _get_secondary_responses(
        self, 
        request: MultiLLMRequest, 
        primary_model: LLMModel
    ) -> List[Dict[str, Any]]:
        """Get responses from secondary models"""
        
        secondary_responses = []
        
        for model in request.config.secondary_models[:2]:  # Limit to 2 secondary models
            try:
                response = await ai_service.chat_completion(
                    messages=request.messages,
                    model=model.value,
                    temperature=request.config.temperature,
                    max_tokens=request.config.max_tokens
                )
                
                secondary_responses.append({
                    "model": model,
                    "response": response,
                    "cost": self.model_costs.get(model.value, 0.01)
                })
                
            except Exception as e:
                # Skip failed models
                continue
        
        return secondary_responses
    
    def _select_best_response(
        self, 
        primary_response: Dict[str, Any], 
        secondary_responses: List[Dict[str, Any]], 
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Select the best response from multiple options"""
        
        responses = [primary_response] + [r["response"] for r in secondary_responses]
        
        # Simple scoring based on response length and content quality
        best_response = primary_response
        best_score = self._score_response(primary_response, analysis)
        
        for response_data in secondary_responses:
            score = self._score_response(response_data["response"], analysis)
            
            # Consider cost in decision
            cost_factor = 1.0 - (response_data["cost"] * 10)  # Lower cost is better
            
            total_score = score * cost_factor
            
            if total_score > best_score:
                best_response = response_data["response"]
                best_score = total_score
        
        return best_response
    
    def _score_response(self, response: Dict[str, Any], analysis: Dict[str, Any]) -> float:
        """Score a response based on quality metrics"""
        
        content = response.get("content", "")
        score = 0.5
        
        # Length score (prefer adequate length)
        if 100 <= len(content) <= 1000:
            score += 0.2
        
        # Content quality scores
        if analysis["has_code"] and "```" in content:
            score += 0.3
        
        if analysis["is_creative"] and len(content.split()) > 50:
            score += 0.2
        
        if analysis["is_analytical"] and any(word in content.lower() for word in ["analysis", "therefore", "conclusion"]):
            score += 0.2
        
        return min(score, 1.0)
    
    def _weighted_random_select(self, models: List[LLMModel], weights: Dict[str, float]) -> LLMModel:
        """Select a model based on weights"""
        
        total_weight = sum(weights.get(model.value, 1.0) for model in models)
        
        if total_weight == 0:
            return random.choice(models)
        
        rand_val = random.uniform(0, total_weight)
        cumulative_weight = 0
        
        for model in models:
            cumulative_weight += weights.get(model.value, 1.0)
            if rand_val <= cumulative_weight:
                return model
        
        return models[-1]

# Global multi-LLM service instance
multi_llm_service = MultiLLMService()