"""
FastAPI 기반 YouTube 영상 분석 API
- 비동기 영상 분석 처리
- 작업 상태 조회
- 결과 조회
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
import uuid
import os
import logging
from datetime import datetime
from enum import Enum
import json
import asyncio

import sys
from pathlib import Path
import re

logger = logging.getLogger(__name__)

# 프로젝트 루트를 PYTHONPATH에 추가
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


def remove_repetitive_sentences(text: str, max_repetition: int = 2) -> str:
    """
    반복되는 문장을 제거하는 함수

    Args:
        text: 입력 텍스트
        max_repetition: 허용할 최대 반복 횟수

    Returns:
        반복이 제거된 텍스트
    """
    if not text:
        return text

    # 문장 단위로 분리 (마침표, 느낌표, 물음표 기준)
    sentences = re.split(r'([.!?]\s*)', text)

    # 분리된 문장을 다시 합치기 (구분자 포함)
    combined = []
    for i in range(0, len(sentences), 2):
        if i + 1 < len(sentences):
            combined.append(sentences[i] + sentences[i + 1])
        else:
            combined.append(sentences[i])

    # 연속된 중복 문장 제거
    result = []
    prev_sentence = None
    repeat_count = 0

    for sentence in combined:
        sentence = sentence.strip()
        if not sentence:
            continue

        if sentence == prev_sentence:
            repeat_count += 1
            if repeat_count < max_repetition:
                result.append(sentence)
        else:
            result.append(sentence)
            prev_sentence = sentence
            repeat_count = 0

    return ' '.join(result).strip()

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

# 전역 모델 캐시 (서버 시작 시 한 번만 로드)
_vision_analyzer: Optional[LlamaVisionAnalyzer] = None
_text_analyzer: Optional[LlamaTextAnalyzer] = None
_models_loaded = False


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
# 모델 로딩 함수
# ============================================================================

def load_models(vision_quantization: str = "int4", text_quantization: str = "int4"):
    """
    서버 시작 시 모델을 한 번만 로드합니다.

    Args:
        vision_quantization: Vision 모델 양자화 방식 (int4/int8/bfloat16)
        text_quantization: Text 모델 양자화 방식 (int4/int8/fp16)
    """
    global _vision_analyzer, _text_analyzer, _models_loaded

    if _models_loaded:
        logger.info("모델이 이미 로드되어 있습니다.")
        return

    logger.info("=== 모델 로딩 시작 ===")

    # Vision 모델 로드
    logger.info(f"Vision 모델 로딩 중... (quantization: {vision_quantization})")
    _vision_analyzer = LlamaVisionAnalyzer(quantization=vision_quantization)
    logger.info("✅ Vision 모델 로드 완료")

    # Text 모델 로드
    logger.info(f"Text 모델 로딩 중... (quantization: {text_quantization})")
    _text_analyzer = LlamaTextAnalyzer(quantization=text_quantization)
    logger.info("✅ Text 모델 로드 완료")

    _models_loaded = True
    logger.info("=== 모든 모델 로딩 완료 ===")


def get_vision_analyzer() -> LlamaVisionAnalyzer:
    """Vision 분석기 인스턴스 반환"""
    if not _models_loaded or _vision_analyzer is None:
        raise RuntimeError("모델이 로드되지 않았습니다. 서버 시작 시 모델을 로드해주세요.")
    return _vision_analyzer


def get_text_analyzer() -> LlamaTextAnalyzer:
    """Text 분석기 인스턴스 반환"""
    if not _models_loaded or _text_analyzer is None:
        raise RuntimeError("모델이 로드되지 않았습니다. 서버 시작 시 모델을 로드해주세요.")
    return _text_analyzer


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드"""
    # 환경 변수로 양자화 방식 설정 가능
    vision_quant = os.getenv("VISION_QUANTIZATION", "int4")
    text_quant = os.getenv("TEXT_QUANTIZATION", "int4")

    load_models(vision_quantization=vision_quant, text_quantization=text_quant)


# ============================================================================
# 분석 함수
# ============================================================================

def analyze_video_sync(
    youtube_url: str,
    max_frames: int,
    proxy: Optional[str],
    user_prompt: Optional[str] = None
) -> AnalysisResult:
    """
    영상 분석을 수행하고 결과를 반환합니다.
    """
    task_id = str(uuid.uuid4())
    output_dir = f"temp_analysis_{task_id}"

    # 초기 결과 객체 생성
    result = AnalysisResult(
        task_id=task_id,
        status=TaskStatus.DOWNLOADING,
        youtube_url=youtube_url,
        created_at=datetime.now().isoformat()
    )

    try:

        # 1. 영상 다운로드 및 프레임 추출
        os.makedirs(output_dir, exist_ok=True)
        frame_extractor = FrameExtractor(output_dir=output_dir)

        download_result = frame_extractor.download_video(youtube_url)
        if not download_result['success']:
            raise Exception(f"영상 다운로드 실패: {download_result['error']}")

        video_path = download_result['path']
        result.video_info = {
            "title": download_result['title'],
            "duration": download_result['duration'],
            "channel": download_result.get('channel', 'Unknown')
        }

        # 프레임 추출
        result.status = TaskStatus.EXTRACTING_FRAMES
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
        result.status = TaskStatus.EXTRACTING_TRANSCRIPT
        transcript_result = TranscriptExtractor.get_transcript(
            youtube_url,
            languages=['ko', 'en']
        )

        transcript = transcript_result['full_text'] if transcript_result['success'] else "[자막 없음]"
        result.transcript = transcript

        # 3. Vision 분석 (캐싱된 모델 사용)
        result.status = TaskStatus.ANALYZING_VISION
        vision_analyzer = get_vision_analyzer()

        # 프롬프트 구성
        base_prompt = "이 프레임에서 다음을 설명하세요:\n1. 주요 객체\n2. 사람이나 행동\n3. 화면에 보이는 텍스트"

        if user_prompt:
            final_prompt = f"{user_prompt}\n\n{base_prompt}"
        else:
            final_prompt = base_prompt

        frame_analyses = []
        for i, frame_path in enumerate(frames):
            if transcript and transcript != "[자막 없음]":
                analysis = vision_analyzer.analyze_with_context(
                    image=frame_path,
                    prompt=final_prompt,
                    context=f"영상 자막 컨텍스트:\n{transcript[:500]}",
                    max_tokens=150,
                    temperature=0.0
                )
            else:
                analysis = vision_analyzer.analyze_image(
                    image=frame_path,
                    prompt=final_prompt,
                    max_tokens=150,
                    temperature=0.0
                )

            # 후처리: 반복 문장 제거
            cleaned_analysis = remove_repetitive_sentences(analysis, max_repetition=1)
            frame_analyses.append(cleaned_analysis)

            # 프레임 삭제
            if os.path.exists(frame_path):
                os.remove(frame_path)

        result.frame_analyses = frame_analyses

        # 4. Text 분석 (캐싱된 모델 사용)
        result.status = TaskStatus.ANALYZING_TEXT
        text_analyzer = get_text_analyzer()

        summary = text_analyzer.summarize_video(
            frame_analyses=frame_analyses,
            transcript=transcript,
            max_tokens=2048,
            temperature=0.3
        )
        result.summary = summary

        key_points = text_analyzer.extract_key_points(
            transcript if transcript != "[자막 없음]" else "\n".join(frame_analyses),
            max_points=5
        )
        result.key_points = key_points

        # 완료
        result.status = TaskStatus.COMPLETED
        result.completed_at = datetime.now().isoformat()

    except Exception as e:
        result.status = TaskStatus.FAILED
        result.error = str(e)
        result.completed_at = datetime.now().isoformat()

    finally:
        # 임시 디렉토리 정리
        import shutil
        if os.path.exists(output_dir):
            try:
                shutil.rmtree(output_dir)
            except Exception as e:
                logger.warning(f"임시 디렉토리 삭제 실패: {e}")

    return result


async def analyze_video_stream(
    youtube_url: str,
    max_frames: int,
    proxy: Optional[str],
    user_prompt: Optional[str] = None
):
    """
    영상 분석을 수행하면서 실시간으로 진행 상황을 스트리밍합니다.
    """
    task_id = str(uuid.uuid4())
    output_dir = f"temp_analysis_{task_id}"

    try:
        # 시작 메시지
        yield f"data: {json.dumps({'status': 'started', 'task_id': task_id, 'progress': 0, 'message': '분석 시작'})}\n\n"
        await asyncio.sleep(0.1)

        # 1. 영상 다운로드 및 프레임 추출
        yield f"data: {json.dumps({'status': 'downloading', 'progress': 10, 'message': '영상 다운로드 중...'})}\n\n"
        await asyncio.sleep(0.1)

        os.makedirs(output_dir, exist_ok=True)
        frame_extractor = FrameExtractor(output_dir=output_dir)

        download_result = frame_extractor.download_video(youtube_url)
        if not download_result['success']:
            error_msg = f"영상 다운로드 실패: {download_result['error']}"
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"
            return

        video_path = download_result['path']
        video_info = {
            "title": download_result['title'],
            "duration": download_result['duration'],
            "channel": download_result.get('channel', 'Unknown')
        }

        message = f"다운로드 완료: {video_info['title']}"
        yield f"data: {json.dumps({'status': 'download_complete', 'progress': 20, 'message': message, 'video_info': video_info})}\n\n"
        await asyncio.sleep(0.1)

        # 프레임 추출
        yield f"data: {json.dumps({'status': 'extracting_frames', 'progress': 25, 'message': '프레임 추출 중...'})}\n\n"
        await asyncio.sleep(0.1)

        frames_result = frame_extractor.extract_frames_scene_detect(
            video_path,
            max_frames=max_frames
        )

        if not frames_result['success']:
            error_msg = f"프레임 추출 실패: {frames_result['error']}"
            yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"
            return

        frames = [frame['path'] for frame in frames_result['frames']]

        # 영상 파일 삭제
        if os.path.exists(video_path):
            os.remove(video_path)

        message = f"{len(frames)}개 프레임 추출 완료"
        yield f"data: {json.dumps({'status': 'frames_extracted', 'progress': 35, 'message': message})}\n\n"
        await asyncio.sleep(0.1)

        # 2. 자막 추출
        yield f"data: {json.dumps({'status': 'extracting_transcript', 'progress': 40, 'message': '자막 추출 중...'})}\n\n"
        await asyncio.sleep(0.1)

        transcript_result = TranscriptExtractor.get_transcript(
            youtube_url,
            languages=['ko', 'en']
        )

        transcript = transcript_result['full_text'] if transcript_result['success'] else "[자막 없음]"

        yield f"data: {json.dumps({'status': 'transcript_extracted', 'progress': 45, 'message': '자막 추출 완료'})}\n\n"
        await asyncio.sleep(0.1)

        # 3. Vision 분석
        yield f"data: {json.dumps({'status': 'analyzing_vision', 'progress': 50, 'message': 'Vision 모델로 프레임 분석 중...'})}\n\n"
        await asyncio.sleep(0.1)

        vision_analyzer = get_vision_analyzer()

        # 프롬프트 구성
        base_prompt = "이 프레임에서 다음을 설명하세요:\n1. 주요 객체\n2. 사람이나 행동\n3. 화면에 보이는 텍스트"

        if user_prompt:
            final_prompt = f"{user_prompt}\n\n{base_prompt}"
        else:
            final_prompt = base_prompt

        frame_analyses = []
        for i, frame_path in enumerate(frames):
            progress = 50 + int((i / len(frames)) * 30)  # 50% ~ 80%
            message = f"프레임 {i+1}/{len(frames)} 분석 중..."
            yield f"data: {json.dumps({'status': 'analyzing_vision', 'progress': progress, 'message': message})}\n\n"
            await asyncio.sleep(0.1)

            if transcript and transcript != "[자막 없음]":
                analysis = vision_analyzer.analyze_with_context(
                    image=frame_path,
                    prompt=final_prompt,
                    context=f"영상 자막 컨텍스트:\n{transcript[:500]}",
                    max_tokens=150,
                    temperature=0.0
                )
            else:
                analysis = vision_analyzer.analyze_image(
                    image=frame_path,
                    prompt=final_prompt,
                    max_tokens=150,
                    temperature=0.0
                )

            # 후처리: 반복 문장 제거
            cleaned_analysis = remove_repetitive_sentences(analysis, max_repetition=1)
            frame_analyses.append(cleaned_analysis)

            # 프레임 삭제
            if os.path.exists(frame_path):
                os.remove(frame_path)

        yield f"data: {json.dumps({'status': 'vision_complete', 'progress': 80, 'message': 'Vision 분석 완료'})}\n\n"
        await asyncio.sleep(0.1)

        # 4. Text 분석
        yield f"data: {json.dumps({'status': 'analyzing_text', 'progress': 85, 'message': 'Text 모델로 요약 생성 중...'})}\n\n"
        await asyncio.sleep(0.1)

        text_analyzer = get_text_analyzer()

        summary = text_analyzer.summarize_video(
            frame_analyses=frame_analyses,
            transcript=transcript,
            max_tokens=2048,
            temperature=0.3
        )

        yield f"data: {json.dumps({'status': 'summary_complete', 'progress': 92, 'message': '요약 생성 완료'})}\n\n"
        await asyncio.sleep(0.1)

        yield f"data: {json.dumps({'status': 'extracting_keypoints', 'progress': 95, 'message': '핵심 포인트 추출 중...'})}\n\n"
        await asyncio.sleep(0.1)

        key_points = text_analyzer.extract_key_points(
            transcript if transcript != "[자막 없음]" else "\n".join(frame_analyses),
            max_points=5
        )

        # 최종 결과
        result = {
            "task_id": task_id,
            "status": "completed",
            "youtube_url": youtube_url,
            "created_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat(),
            "video_info": video_info,
            "summary": summary,
            "key_points": key_points,
            "frame_analyses": frame_analyses,
            "transcript": transcript
        }

        yield f"data: {json.dumps({'status': 'completed', 'progress': 100, 'message': '분석 완료!', 'result': result}, ensure_ascii=False)}\n\n"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"분석 중 오류 발생: {error_msg}")
        yield f"data: {json.dumps({'status': 'failed', 'error': error_msg})}\n\n"

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
            "POST /analyze": "영상 분석 (스트리밍)",
            "POST /analyze/sync": "영상 분석 (동기식)",
            "GET /tasks/{task_id}": "작업 상태 및 결과 조회",
            "GET /tasks": "모든 작업 목록 조회",
            "DELETE /tasks/{task_id}": "작업 삭제"
        }
    }


@app.post("/analyze")
async def analyze_video(request: AnalyzeRequest):
    """
    YouTube 영상 분석 (스트리밍 - 실시간 진행 상황 + 최종 결과)

    Server-Sent Events (SSE) 형식으로 실시간 진행 상황을 전달합니다.

    - **youtube_url**: YouTube 영상 URL
    - **max_frames**: 최대 추출 프레임 수 (기본: 8)
    - **proxy**: 프록시 서버 (선택)

    ### 응답 형식 (SSE)
    각 이벤트는 다음 형식으로 전달됩니다:
    ```
    data: {"status": "...", "progress": 0-100, "message": "...", ...}
    ```

    ### 상태 종류
    - `started`: 분석 시작
    - `downloading`: 영상 다운로드 중
    - `download_complete`: 다운로드 완료
    - `extracting_frames`: 프레임 추출 중
    - `frames_extracted`: 프레임 추출 완료
    - `extracting_transcript`: 자막 추출 중
    - `transcript_extracted`: 자막 추출 완료
    - `analyzing_vision`: Vision 모델 분석 중
    - `vision_complete`: Vision 분석 완료
    - `analyzing_text`: Text 모델 분석 중
    - `summary_complete`: 요약 생성 완료
    - `extracting_keypoints`: 핵심 포인트 추출 중
    - `completed`: 분석 완료 (result 포함)
    - `failed`: 오류 발생 (error 포함)
    """
    return StreamingResponse(
        analyze_video_stream(
            youtube_url=str(request.youtube_url),
            max_frames=request.max_frames,
            proxy=request.proxy,
            user_prompt=request.user_prompt
        ),
        media_type="text/event-stream"
    )


@app.post("/analyze/sync", response_model=AnalysisResult)
def analyze_video_sync_endpoint(request: AnalyzeRequest):
    """
    YouTube 영상 분석 (동기식 - 분석 완료 후 결과 반환)

    타임아웃이 발생할 수 있으므로 /analyze (스트리밍) 사용을 권장합니다.

    - **youtube_url**: YouTube 영상 URL
    - **max_frames**: 최대 추출 프레임 수 (기본: 8)
    - **proxy**: 프록시 서버 (선택)
    """
    result = analyze_video_sync(
        youtube_url=str(request.youtube_url),
        max_frames=request.max_frames,
        proxy=request.proxy,
        user_prompt=request.user_prompt
    )

    return result


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
        "models_loaded": _models_loaded,
        "vision_model_loaded": _vision_analyzer is not None,
        "text_model_loaded": _text_analyzer is not None,
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
