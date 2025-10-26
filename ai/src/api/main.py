"""
FastAPI 기반 YouTube 영상 분석 API
- 비동기 영상 분석 처리
- 작업 상태 조회
- 결과 조회
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
import uuid
import os
import logging
from datetime import datetime
from enum import Enum

import sys
from pathlib import Path

logger = logging.getLogger(__name__)

# 프로젝트 루트를 PYTHONPATH에 추가
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.core import (
    FrameExtractor,
    TranscriptExtractor,
    LlamaVisionAnalyzer,
    LlamaTextAnalyzer
)
from src.api.models import (
    TaskStatus,
    AnalyzeRequest,
    TaskResponse,
    AnalysisResult
)
import torch


# ============================================================================
# 전역 상태 저장소 (실제 프로덕션에서는 Redis 등 사용)
# ============================================================================

tasks: Dict[str, AnalysisResult] = {}


# ============================================================================
# FastAPI 앱 초기화
# ============================================================================

app = FastAPI(
    title="YouTube Video Analysis API",
    description="Llama 3.2 Vision + Llama 3.1을 사용한 YouTube 영상 분석 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# 분석 함수
# ============================================================================

def analyze_video_task(
    task_id: str,
    youtube_url: str,
    max_frames: int,
    vision_quantization: str,
    text_quantization: str,
    proxy: Optional[str]
):
    """
    백그라운드에서 실행되는 영상 분석 작업
    """
    output_dir = f"temp_analysis_{task_id}"

    try:
        # 작업 상태 업데이트
        tasks[task_id].status = TaskStatus.DOWNLOADING

        # 1. 영상 다운로드 및 프레임 추출
        os.makedirs(output_dir, exist_ok=True)
        frame_extractor = FrameExtractor(output_dir=output_dir)

        download_result = frame_extractor.download_video(youtube_url)
        if not download_result['success']:
            raise Exception(f"영상 다운로드 실패: {download_result['error']}")

        video_path = download_result['path']
        tasks[task_id].video_info = {
            "title": download_result['title'],
            "duration": download_result['duration'],
            "channel": download_result.get('channel', 'Unknown')
        }

        # 프레임 추출
        tasks[task_id].status = TaskStatus.EXTRACTING_FRAMES
        frames_result = frame_extractor.extract_frames_scene_detect(
            video_path,
            max_frames=max_frames
        )

        if not frames_result['success']:
            raise Exception(f"프레임 추출 실패: {frames_result['error']}")

        frames = [frame['path'] for frame in frames_result['frames']]

        # 영상 파일 삭제
        if os.path.exists(video_path):
            os.remove(video_path)

        # 2. 자막 추출
        tasks[task_id].status = TaskStatus.EXTRACTING_TRANSCRIPT
        transcript_result = TranscriptExtractor.get_transcript(
            youtube_url,
            languages=['ko', 'en']
        )

        transcript = transcript_result['full_text'] if transcript_result['success'] else "[자막 없음]"
        tasks[task_id].transcript = transcript

        # 3. Vision 분석
        tasks[task_id].status = TaskStatus.ANALYZING_VISION
        vision_analyzer = LlamaVisionAnalyzer(quantization=vision_quantization)

        frame_analyses = []
        for i, frame_path in enumerate(frames):
            if transcript and transcript != "[자막 없음]":
                analysis = vision_analyzer.analyze_with_context(
                    image=frame_path,
                    prompt="이 프레임에서 무엇이 일어나고 있나요? 주요 객체, 사람, 텍스트, 행동을 자세히 설명해주세요.",
                    context=f"영상 자막 컨텍스트:\n{transcript[:500]}",
                    max_tokens=1024,
                    temperature=0.5
                )
            else:
                analysis = vision_analyzer.analyze_image(
                    image=frame_path,
                    prompt="이 프레임에서 무엇이 일어나고 있나요? 주요 객체, 사람, 텍스트, 행동을 자세히 설명해주세요.",
                    max_tokens=1024,
                    temperature=0.5
                )

            frame_analyses.append(analysis)

            # 프레임 삭제
            if os.path.exists(frame_path):
                os.remove(frame_path)

        tasks[task_id].frame_analyses = frame_analyses

        # Vision 모델 메모리 정리
        vision_analyzer.cleanup()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        # 4. Text 분석
        tasks[task_id].status = TaskStatus.ANALYZING_TEXT
        text_analyzer = LlamaTextAnalyzer(quantization=text_quantization)

        summary = text_analyzer.summarize_video(
            frame_analyses=frame_analyses,
            transcript=transcript,
            max_tokens=2048,
            temperature=0.3
        )
        tasks[task_id].summary = summary

        key_points = text_analyzer.extract_key_points(
            transcript if transcript != "[자막 없음]" else "\n".join(frame_analyses),
            max_points=5
        )
        tasks[task_id].key_points = key_points

        # Text 모델 메모리 정리
        text_analyzer.cleanup()

        # 완료
        tasks[task_id].status = TaskStatus.COMPLETED
        tasks[task_id].completed_at = datetime.now().isoformat()

    except Exception as e:
        tasks[task_id].status = TaskStatus.FAILED
        tasks[task_id].error = str(e)
        tasks[task_id].completed_at = datetime.now().isoformat()

    finally:
        # 임시 디렉토리 정리
        import shutil
        if os.path.exists(output_dir):
            try:
                shutil.rmtree(output_dir)
            except Exception as e:
                logger.warning(f"임시 디렉토리 삭제 실패: {e}")


# ============================================================================
# API 엔드포인트
# ============================================================================

@app.get("/")
def root():
    """API 정보"""
    return {
        "name": "YouTube Video Analysis API",
        "version": "1.0.0",
        "description": "Llama 3.2 Vision + Llama 3.1을 사용한 YouTube 영상 분석",
        "endpoints": {
            "POST /analyze": "영상 분석 작업 시작",
            "GET /tasks/{task_id}": "작업 상태 및 결과 조회",
            "GET /tasks": "모든 작업 목록 조회",
            "DELETE /tasks/{task_id}": "작업 삭제"
        }
    }


@app.post("/analyze", response_model=TaskResponse)
async def analyze_video(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    YouTube 영상 분석 시작

    - **youtube_url**: YouTube 영상 URL
    - **max_frames**: 최대 추출 프레임 수 (기본: 8)
    - **vision_quantization**: Vision 모델 양자화 (int4/int8/fp16)
    - **text_quantization**: Text 모델 양자화 (int4/int8/fp16)
    - **proxy**: 프록시 서버 (선택)
    """
    # 작업 ID 생성
    task_id = str(uuid.uuid4())

    # 초기 작업 상태 생성
    tasks[task_id] = AnalysisResult(
        task_id=task_id,
        status=TaskStatus.PENDING,
        youtube_url=str(request.youtube_url),
        created_at=datetime.now().isoformat()
    )

    # 백그라운드 작업 시작
    background_tasks.add_task(
        analyze_video_task,
        task_id=task_id,
        youtube_url=str(request.youtube_url),
        max_frames=request.max_frames,
        vision_quantization=request.vision_quantization,
        text_quantization=request.text_quantization,
        proxy=request.proxy
    )

    return TaskResponse(
        task_id=task_id,
        status=TaskStatus.PENDING,
        message="영상 분석 작업이 시작되었습니다."
    )


@app.get("/tasks/{task_id}", response_model=AnalysisResult)
async def get_task(task_id: str):
    """
    작업 상태 및 결과 조회

    - **task_id**: 작업 ID
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    return tasks[task_id]


@app.get("/tasks")
async def list_tasks():
    """
    모든 작업 목록 조회
    """
    return {
        "total": len(tasks),
        "tasks": [
            {
                "task_id": task.task_id,
                "status": task.status,
                "youtube_url": task.youtube_url,
                "created_at": task.created_at,
                "completed_at": task.completed_at
            }
            for task in tasks.values()
        ]
    }


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """
    작업 삭제

    - **task_id**: 작업 ID
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    del tasks[task_id]

    return {
        "message": f"작업 {task_id}가 삭제되었습니다."
    }


@app.get("/health")
async def health_check():
    """
    헬스 체크
    """
    gpu_available = torch.cuda.is_available()

    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "gpu_name": torch.cuda.get_device_name(0) if gpu_available else None,
        "active_tasks": sum(1 for task in tasks.values() if task.status not in [TaskStatus.COMPLETED, TaskStatus.FAILED])
    }


if __name__ == "__main__":
    import uvicorn

    # 환경변수로 포트 설정 가능
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "src.api.main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
