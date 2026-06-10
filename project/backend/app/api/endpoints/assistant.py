from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.gemini import gemini_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest):
    """
    Send a prompt to the AI DevOps Assistant and get a solution/response.
    """
    try:
        response_text = gemini_service.chat_assistant(request.message, request.history)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running assistant: {str(e)}"
        )
