import asyncio
import time
from typing import Dict, Any, List, Optional
import json
import re
from datetime import datetime

from services.ai_service import ai_service

class EmotionalService:
    """Service for emotional intelligence and empathy analysis"""
    
    def __init__(self):
        self.emotion_keywords = {
            "happy": ["happy", "joy", "excited", "glad", "cheerful", "delighted", "pleased", "thrilled"],
            "sad": ["sad", "unhappy", "depressed", "down", "miserable", "gloomy", "melancholy"],
            "angry": ["angry", "mad", "furious", "irritated", "annoyed", "frustrated", "upset"],
            "fear": ["afraid", "scared", "terrified", "anxious", "worried", "nervous", "fearful"],
            "surprise": ["surprised", "amazed", "astonished", "shocked", "startled", "stunned"],
            "disgust": ["disgusted", "revolted", "sickened", "repulsed", "appalled"],
            "neutral": ["okay", "fine", "normal", "average", "standard"]
        }
        
        self.empathy_patterns = {
            "understanding": [
                "I understand", "I see", "I get it", "That makes sense", 
                "I can see why", "That sounds", "I can imagine"
            ],
            "validation": [
                "It's okay to feel", "Your feelings are valid", "That's understandable",
                "Anyone would feel", "It's natural to", "I hear you"
            ],
            "support": [
                "I'm here for you", "How can I help?", "What do you need?",
                "Let me help", "I support you", "We'll get through this"
            ],
            "encouragement": [
                "You can do this", "I believe in you", "You're capable",
                "Keep going", "Don't give up", "You've got this"
            ]
        }
        
        self.tone_indicators = {
            "urgent": ["asap", "urgent", "immediately", "right now", "quickly", "hurry"],
            "frustrated": ["ugh", "seriously", "again", "this is ridiculous", "why is this"],
            "confused": ["I don't understand", "confused", "what do you mean", "huh", "explain"],
            "grateful": ["thank you", "thanks", "appreciate", "grateful", "helpful"],
            "apologetic": ["sorry", "apologies", "my fault", "I apologize", "forgive me"]
        }
    
    async def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """
        Analyze emotion and sentiment in text
        """
        
        try:
            # Use AI for deep analysis
            analysis_prompt = f"""
            Analyze the emotional content of this text and provide a detailed analysis:
            
            Text: "{text}"
            
            Please provide:
            1. Primary emotion (happy, sad, angry, fear, surprise, disgust, neutral)
            2. Secondary emotions (if any)
            3. Sentiment (positive, negative, neutral)
            4. Intensity (low, medium, high)
            5. Confidence level (0-1)
            6. Key emotional indicators found
            """
            
            response = await ai_service.chat_completion(
                messages=[{"role": "user", "content": analysis_prompt}],
                model="gpt-4o",
                temperature=0.3
            )
            
            # Parse AI response (in production, use structured output)
            analysis = self._parse_emotion_analysis(response["content"])
            
            # Enhance with keyword-based analysis
            keyword_analysis = self._keyword_emotion_analysis(text)
            
            # Combine analyses
            combined_analysis = {
                "primary_emotion": analysis.get("primary_emotion", keyword_analysis["primary_emotion"]),
                "secondary_emotions": analysis.get("secondary_emotions", keyword_analysis["secondary_emotions"]),
                "sentiment": analysis.get("sentiment", keyword_analysis["sentiment"]),
                "intensity": analysis.get("intensity", keyword_analysis["intensity"]),
                "confidence": analysis.get("confidence", 0.8),
                "keywords_found": keyword_analysis["keywords_found"],
                "tone_indicators": self._analyze_tone(text),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return combined_analysis
            
        except Exception as e:
            # Fallback to keyword analysis
            return self._keyword_emotion_analysis(text)
    
    def _parse_emotion_analysis(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI emotion analysis response"""
        
        # Simple parsing (in production, use more robust parsing)
        lines = ai_response.split('\n')
        analysis = {}
        
        for line in lines:
            line = line.strip().lower()
            
            if "primary emotion:" in line:
                analysis["primary_emotion"] = line.split("primary emotion:")[-1].strip()
            elif "secondary emotions:" in line:
                emotions = line.split("secondary emotions:")[-1].strip()
                analysis["secondary_emotions"] = [e.strip() for e in emotions.split(",") if e.strip()]
            elif "sentiment:" in line:
                analysis["sentiment"] = line.split("sentiment:")[-1].strip()
            elif "intensity:" in line:
                analysis["intensity"] = line.split("intensity:")[-1].strip()
            elif "confidence:" in line:
                confidence_str = line.split("confidence:")[-1].strip()
                try:
                    analysis["confidence"] = float(confidence_str)
                except:
                    analysis["confidence"] = 0.8
        
        return analysis
    
    def _keyword_emotion_analysis(self, text: str) -> Dict[str, Any]:
        """Perform keyword-based emotion analysis"""
        
        text_lower = text.lower()
        emotion_scores = {}
        keywords_found = []
        
        # Score emotions based on keywords
        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            found_keywords = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
                    found_keywords.append(keyword)
            
            if score > 0:
                emotion_scores[emotion] = score
                keywords_found.extend(found_keywords)
        
        # Determine primary emotion
        primary_emotion = max(emotion_scores, key=emotion_scores.get) if emotion_scores else "neutral"
        
        # Determine sentiment
        positive_emotions = ["happy", "surprise"]
        negative_emotions = ["sad", "angry", "fear", "disgust"]
        
        if primary_emotion in positive_emotions:
            sentiment = "positive"
        elif primary_emotion in negative_emotions:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        # Determine intensity
        max_score = max(emotion_scores.values()) if emotion_scores else 0
        if max_score >= 3:
            intensity = "high"
        elif max_score >= 2:
            intensity = "medium"
        else:
            intensity = "low"
        
        # Get secondary emotions
        secondary_emotions = [
            emotion for emotion, score in emotion_scores.items()
            if emotion != primary_emotion and score > 0
        ]
        
        return {
            "primary_emotion": primary_emotion,
            "secondary_emotions": secondary_emotions,
            "sentiment": sentiment,
            "intensity": intensity,
            "confidence": 0.6,  # Lower confidence for keyword analysis
            "keywords_found": keywords_found
        }
    
    def _analyze_tone(self, text: str) -> Dict[str, Any]:
        """Analyze tone indicators in text"""
        
        text_lower = text.lower()
        tone_indicators = {}
        
        for tone, indicators in self.tone_indicators.items():
            found_indicators = []
            for indicator in indicators:
                if indicator in text_lower:
                    found_indicators.append(indicator)
            
            if found_indicators:
                tone_indicators[tone] = found_indicators
        
        return tone_indicators
    
    async def generate_empathetic_response(
        self, 
        user_message: str, 
        emotion_analysis: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate an empathetic response based on emotion analysis
        """
        
        try:
            # Build empathetic prompt
            primary_emotion = emotion_analysis.get("primary_emotion", "neutral")
            sentiment = emotion_analysis.get("sentiment", "neutral")
            intensity = emotion_analysis.get("intensity", "medium")
            tone_indicators = emotion_analysis.get("tone_indicators", {})
            
            prompt = f"""
            Generate an empathetic response to this user message:
            
            User Message: "{user_message}"
            
            Emotion Analysis:
            - Primary Emotion: {primary_emotion}
            - Sentiment: {sentiment}
            - Intensity: {intensity}
            - Tone Indicators: {tone_indicators}
            
            Context: {context or 'General conversation'}
            
            Guidelines:
            1. Acknowledge the user's emotional state
            2. Show understanding and validation
            3. Use appropriate tone based on emotion and intensity
            4. Be supportive and helpful
            5. Adapt your language style to match the user's needs
            6. Include specific empathy patterns (understanding, validation, support, encouragement)
            
            Please provide a natural, empathetic response:
            """
            
            response = await ai_service.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                model="gpt-4o",
                temperature=0.7
            )
            
            return response["content"]
            
        except Exception as e:
            # Fallback empathetic response
            return self._generate_fallback_empathy(user_message, emotion_analysis)
    
    def _generate_fallback_empathy(self, user_message: str, emotion_analysis: Dict[str, Any]) -> str:
        """Generate fallback empathetic response"""
        
        primary_emotion = emotion_analysis.get("primary_emotion", "neutral")
        
        empathy_responses = {
            "happy": [
                "I'm so glad to hear that! Your positive energy is wonderful. What's making you feel this way?",
                "That's fantastic! It's great to see you so happy. Tell me more about what's exciting you."
            ],
            "sad": [
                "I'm sorry to hear you're feeling this way. It's okay to feel sad, and I'm here to listen and support you.",
                "I can sense that you're feeling down. Your feelings are completely valid, and I want to help you through this."
            ],
            "angry": [
                "I can understand why you'd feel angry about this. Your frustration is completely valid, and I'm here to help.",
                "I hear the frustration in your message. Let's work together to address what's making you angry."
            ],
            "fear": [
                "I can sense that you're feeling anxious or scared. It's completely normal to feel this way, and I'm here to help.",
                "I understand this situation might be frightening for you. You're not alone, and we'll face this together."
            ],
            "neutral": [
                "I understand what you're sharing. How can I best help you with this situation?",
                "Thank you for sharing that with me. I'm here to listen and assist you in any way I can."
            ]
        }
        
        responses = empathy_responses.get(primary_emotion, empathy_responses["neutral"])
        return responses[0] if responses else "I understand. How can I help you today?"
    
    async def adapt_communication_style(
        self, 
        user_message: str, 
        emotion_analysis: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Adapt communication style based on user's emotional state
        """
        
        primary_emotion = emotion_analysis.get("primary_emotion", "neutral")
        intensity = emotion_analysis.get("intensity", "medium")
        tone_indicators = emotion_analysis.get("tone_indicators", {})
        
        # Determine communication style adaptations
        adaptations = {
            "formality": "neutral",
            "pace": "normal",
            "empathy_level": "medium",
            "directness": "balanced",
            "support_level": "medium"
        }
        
        # Adapt based on emotion
        if primary_emotion in ["sad", "fear"]:
            adaptations["empathy_level"] = "high"
            adaptations["support_level"] = "high"
            adaptations["pace"] = "slower"
            adaptations["directness"] = "gentle"
        
        elif primary_emotion == "angry":
            adaptations["empathy_level"] = "high"
            adaptations["pace"] = "calm"
            adaptations["directness"] = "diplomatic"
            adaptations["support_level"] = "high"
        
        elif primary_emotion == "happy":
            adaptations["pace"] = "energetic"
            adaptations["empathy_level"] = "medium"
            adaptations["directness"] = "enthusiastic"
        
        # Adapt based on intensity
        if intensity == "high":
            adaptations["empathy_level"] = "high"
            adaptations["support_level"] = "high"
            adaptations["pace"] = "calmer" if primary_emotion in ["angry", "fear"] else "more energetic"
        
        # Adapt based on tone indicators
        if "urgent" in tone_indicators:
            adaptations["pace"] = "faster"
            adaptations["directness"] = "more direct"
        
        if "confused" in tone_indicators:
            adaptations["pace"] = "slower"
            adaptations["directness"] = "clearer"
            adaptations["formality"] = "simpler"
        
        return adaptations
    
    async def should escalate_to_human(
        self, 
        user_message: str, 
        emotion_analysis: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        """
        Determine if conversation should be escalated to human agent
        """
        
        primary_emotion = emotion_analysis.get("primary_emotion", "neutral")
        intensity = emotion_analysis.get("intensity", "medium")
        sentiment = emotion_analysis.get("sentiment", "neutral")
        
        # Escalation criteria
        escalation_triggers = [
            primary_emotion in ["angry", "fear"] and intensity == "high",
            sentiment == "negative" and intensity == "high",
            any(keyword in user_message.lower() for keyword in ["help", "emergency", "urgent", "desperate"]),
            len(user_message) > 500 and sentiment == "negative",  # Long negative messages
        ]
        
        # Check conversation history for patterns
        if conversation_history:
            recent_messages = conversation_history[-5:]  # Last 5 messages
            negative_count = sum(1 for msg in recent_messages 
                               if msg.get("role") == "user" and 
                               any(neg in msg.get("content", "").lower() 
                                   for neg in ["angry", "frustrated", "upset", "disappointed"]))
            
            if negative_count >= 3:
                escalation_triggers.append(True)
        
        return any(escalation_triggers)

# Global emotional service instance
emotional_service = EmotionalService()