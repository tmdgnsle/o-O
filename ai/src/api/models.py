"""
Pydantic 데이터 모델
"""
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
from enum import Enum


class TaskStatus(str, Enum):
    """작업 상태"""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    EXTRACTING_FRAMES = "extracting_frames"
    EXTRACTING_TRANSCRIPT = "extracting_transcript"
    ANALYZING_VISION = "analyzing_vision"
    ANALYZING_TEXT = "analyzing_text"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalyzeRequest(BaseModel):
    """영상 분석 요청"""
    youtube_url: HttpUrl
    max_frames: int = 8
    vision_quantization: str = "int4"
    text_quantization: str = "int4"
    proxy: Optional[str] = None


class TaskResponse(BaseModel):
    """작업 응답"""
    task_id: str
    status: TaskStatus
    message: str


class AnalysisResult(BaseModel):
    """분석 결과"""
    task_id: str
    status: TaskStatus
    youtube_url: str
    created_at: str
    completed_at: Optional[str] = None
    video_info: Optional[Dict] = None
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    frame_analyses: Optional[List[str]] = None
    transcript: Optional[str] = None
    error: Optional[str] = None
