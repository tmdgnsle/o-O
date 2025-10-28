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
    proxy: Optional[str] = None
    user_prompt: Optional[str] = None  # 영상의 목적/주제 설명 (예: "이 영상은 신제품 홍보 영상입니다")


class TaskResponse(BaseModel):
    """작업 응답"""
    task_id: str
    status: TaskStatus
    message: str


class MindMapNode(BaseModel):
    """마인드맵 노드"""
    keyword: str  # 노드에 표시될 키워드
    description: str  # 노드 상세 설명
    children: Optional[List['MindMapNode']] = None  # 하위 노드들


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
    mindmap: Optional[MindMapNode] = None  # 마인드맵 데이터
    error: Optional[str] = None


# Forward reference 해결
MindMapNode.model_rebuild()
