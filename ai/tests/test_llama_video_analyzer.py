"""
Llama 기반 YouTube 영상 분석 파이프라인
- Llama 3.2 11B Vision: 프레임 이미지 분석
- Llama 3.1 8B: 텍스트 요약 및 합성
- 사용한 파일 자동 삭제
"""
import os
import sys
import shutil
import torch
import logging
from pathlib import Path
from dotenv import load_dotenv

# 프로젝트 루트를 PYTHONPATH에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core import (
    FrameExtractor,
    TranscriptExtractor,
    LlamaVisionAnalyzer,
    LlamaTextAnalyzer
)

load_dotenv()

# HF_TRANSFER 비활성화 (hf_transfer 패키지가 없으면 오류 발생)
os.environ['HF_HUB_ENABLE_HF_TRANSFER'] = '0'

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)


def analyze_youtube_video(
    youtube_url: str,
    output_dir: str = "temp_analysis",
    max_frames: int = 10,
    vision_quantization: str = "int4",
    text_quantization: str = "int4",
    cleanup_files: bool = True
):
    """
    YouTube 영상 분석 전체 파이프라인

    Args:
        youtube_url: YouTube 영상 URL
        output_dir: 임시 출력 디렉토리
        max_frames: 최대 추출 프레임 수
        vision_quantization: Vision 모델 양자화 설정
        text_quantization: Text 모델 양자화 설정
        cleanup_files: 분석 후 파일 자동 삭제 여부

    Returns:
        분석 결과 딕셔너리
    """
    logger.info("=" * 80)
    logger.info("🎬 Llama 기반 YouTube 영상 분석 시작")
    logger.info("=" * 80)
    logger.info(f"📺 영상 URL: {youtube_url}")
    logger.info(f"📁 임시 경로: {output_dir}")
    logger.info(f"🖼️  최대 프레임: {max_frames}")
    logger.info(f"🧹 자동 삭제: {'활성화' if cleanup_files else '비활성화'}\n")

    os.makedirs(output_dir, exist_ok=True)
    video_path = None
    frames = []

    # =========================================================================
    # 1단계: 영상 다운로드 및 프레임 추출
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("1️⃣  영상 다운로드 및 프레임 추출")
    logger.info("=" * 80)

    frame_extractor = FrameExtractor(output_dir=output_dir)

    try:
        download_result = frame_extractor.download_video(youtube_url)
        if not download_result['success']:
            logger.info(f"❌ 영상 다운로드 실패: {download_result['error']}")
            return None

        video_path = download_result['path']
        logger.info(f"✅ 영상 다운로드 완료: {download_result['title']}")
        logger.info(f"⏱️  길이: {download_result['duration']:.0f}초")
    except Exception as e:
        logger.info(f"❌ 영상 다운로드 실패: {e}")
        return None

    try:
        frames_result = frame_extractor.extract_frames_scene_detect(
            video_path,
            max_frames=max_frames
        )

        if not frames_result['success']:
            logger.info(f"❌ 프레임 추출 실패: {frames_result['error']}")
            if cleanup_files and video_path and os.path.exists(video_path):
                os.remove(video_path)
            return None

        frames = [frame['path'] for frame in frames_result['frames']]
        logger.info(f"✅ 프레임 추출 완료: {len(frames)}개")

        # 영상 파일 즉시 삭제
        if cleanup_files and video_path and os.path.exists(video_path):
            os.remove(video_path)
            logger.info(f"🧹 영상 파일 삭제: {video_path}")

    except Exception as e:
        logger.info(f"❌ 프레임 추출 실패: {e}")
        # 실패해도 영상 파일은 삭제
        if cleanup_files and video_path and os.path.exists(video_path):
            os.remove(video_path)
        return None

    # =========================================================================
    # 2단계: 자막/음성 텍스트 추출
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("2️⃣  자막/음성 텍스트 추출")
    logger.info("=" * 80)

    try:
        transcript_result = TranscriptExtractor.get_transcript(youtube_url, languages=['ko', 'en'])

        if transcript_result['success']:
            transcript = transcript_result['full_text']
            logger.info(f"✅ 자막 추출 완료: {len(transcript)} 글자")
            logger.info(f"📝 언어: {transcript_result['language']}")
            logger.info(f"📝 자막 미리보기: {transcript[:200]}...\n")
        else:
            logger.info(f"⚠️  자막 추출 실패: {transcript_result.get('error', 'Unknown error')}")
            transcript = "[자막 없음]"
    except Exception as e:
        logger.info(f"⚠️  자막 추출 실패: {e}")
        transcript = "[자막 없음]"

    # =========================================================================
    # 3단계: 프레임 시각 분석 (Llama 3.2 11B Vision)
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("3️⃣  프레임 시각 분석 (Llama 3.2 11B Vision)")
    logger.info("=" * 80)

    vision_analyzer = LlamaVisionAnalyzer(quantization=vision_quantization)

    frame_analyses = []
    for i, frame_path in enumerate(frames):
        logger.info(f"\n📸 프레임 {i+1}/{len(frames)} 분석 중...")

        try:
            # 자막 컨텍스트와 함께 분석
            if transcript and transcript != "[자막 없음]":
                analysis = vision_analyzer.analyze_with_context(
                    image=frame_path,
                    prompt="이 프레임에서 무엇이 일어나고 있나요? 주요 객체, 사람, 텍스트, 행동을 자세히 설명해주세요.",
                    context=f"영상 자막 컨텍스트:\n{transcript[:500]}",
                    max_tokens=300,
                    temperature=0.5
                )
            else:
                analysis = vision_analyzer.analyze_image(
                    image=frame_path,
                    prompt="이 프레임에서 무엇이 일어나고 있나요? 주요 객체, 사람, 텍스트, 행동을 자세히 설명해주세요.",
                    max_tokens=300,
                    temperature=0.5
                )

            frame_analyses.append(analysis)
            logger.info(f"✅ 분석 완료")
            logger.info(f"   {analysis}")

        except Exception as e:
            logger.info(f"❌ 분석 실패: {e}")
            frame_analyses.append(f"[분석 실패: {e}]")

        finally:
            # 프레임 이미지 즉시 삭제
            if cleanup_files and os.path.exists(frame_path):
                os.remove(frame_path)
                logger.info(f"   🧹 프레임 삭제: {os.path.basename(frame_path)}")

    # Vision 모델 메모리 정리
    vram_after_vision = vision_analyzer.get_vram_usage()
    logger.info(f"\n📊 Vision 모델 VRAM 사용량: {vram_after_vision['allocated_gb']:.2f} GB")
    vision_analyzer.cleanup()

    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        logger.info(f"🧹 메모리 정리 후 VRAM: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

    # =========================================================================
    # 4단계: 종합 요약 생성 (Llama 3.1 8B)
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("4️⃣  종합 요약 생성 (Llama 3.1 8B)")
    logger.info("=" * 80)

    text_analyzer = LlamaTextAnalyzer(quantization=text_quantization)

    try:
        summary = text_analyzer.summarize_video(
            frame_analyses=frame_analyses,
            transcript=transcript,
            max_tokens=2048,
            temperature=0.3
        )
        logger.info("✅ 요약 생성 완료\n")
    except Exception as e:
        logger.info(f"❌ 요약 생성 실패: {e}")
        summary = "[요약 생성 실패]"

    # 핵심 포인트 추출
    try:
        key_points = text_analyzer.extract_key_points(
            transcript if transcript != "[자막 없음]" else "\n".join(frame_analyses),
            max_points=5
        )
        logger.info("✅ 핵심 포인트 추출 완료\n")
    except Exception as e:
        logger.info(f"⚠️  핵심 포인트 추출 실패: {e}")
        key_points = []

    # Text 모델 메모리 정리
    vram_after_text = text_analyzer.get_vram_usage()
    logger.info(f"📊 Text 모델 VRAM 사용량: {vram_after_text['allocated_gb']:.2f} GB")
    text_analyzer.cleanup()

    # =========================================================================
    # 5단계: 결과 출력
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("5️⃣  분석 결과 출력")
    logger.info("=" * 80)

    # 콘솔에 결과 출력
    logger.info("\n" + "=" * 80)
    logger.info("📊 YouTube 영상 분석 결과")
    logger.info("=" * 80)

    logger.info(f"\n📺 영상 URL: {youtube_url}")
    logger.info(f"🖼️  분석된 프레임: {len(frames)}개")
    logger.info(f"📝 자막 길이: {len(transcript)} 글자")

    logger.info("\n" + "-" * 80)
    logger.info("📝 종합 요약")
    logger.info("-" * 80)
    logger.info(summary)

    logger.info("\n" + "-" * 80)
    logger.info("🔑 핵심 포인트")
    logger.info("-" * 80)
    for i, point in enumerate(key_points, 1):
        logger.info(f"{i}. {point}")

    logger.info("\n" + "-" * 80)
    logger.info("🖼️  프레임별 시각 분석")
    logger.info("-" * 80)
    for i, analysis in enumerate(frame_analyses, 1):
        logger.info(f"\n[프레임 {i}]")
        logger.info(analysis)
        logger.info()

    logger.info("-" * 80)
    logger.info("📄 전체 자막")
    logger.info("-" * 80)
    logger.info(transcript)

    logger.info("\n" + "=" * 80)
    logger.info(f"⏰ 분석 일시: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"🤖 분석 모델: Llama 3.2 11B Vision + Llama 3.1 8B")
    logger.info("=" * 80)

    # 임시 디렉토리 삭제
    if cleanup_files and os.path.exists(output_dir):
        try:
            shutil.rmtree(output_dir)
            logger.info(f"\n🧹 임시 디렉토리 삭제: {output_dir}")
        except Exception as e:
            logger.info(f"\n⚠️  임시 디렉토리 삭제 실패: {e}")

    # =========================================================================
    # 완료
    # =========================================================================
    logger.info("\n" + "=" * 80)
    logger.info("✅ 영상 분석 완료!")
    logger.info("=" * 80)

    return {
        "transcript": transcript,
        "frame_analyses": frame_analyses,
        "summary": summary,
        "key_points": key_points
    }


def main():
    """메인 실행 함수"""
    # 테스트할 YouTube URL
    youtube_url = input("YouTube URL을 입력하세요: ").strip()

    if not youtube_url:
        logger.info("❌ URL이 입력되지 않았습니다.")
        return

    # 분석 실행
    result = analyze_youtube_video(
        youtube_url=youtube_url,
        output_dir="temp_analysis",  # 임시 디렉토리
        max_frames=8,
        vision_quantization="int4",  # INT4: ~10GB VRAM
        text_quantization="int4",    # INT4: ~4GB VRAM (순차 실행이므로 중복 없음)
        cleanup_files=True           # 분석 후 파일 자동 삭제
    )

    if result:
        logger.info("\n🎉 분석이 성공적으로 완료되었습니다!")
    else:
        logger.info("\n❌ 분석 중 오류가 발생했습니다.")


if __name__ == "__main__":
    main()
