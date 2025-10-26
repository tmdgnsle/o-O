"""
import logging
logger = logging.getLogger(__name__)
YouTube 영상 분석 테스트 스크립트
RTX A5000 24GB VRAM 최적화
"""
import logging

logger = logging.getLogger(__name__)

import os
from dotenv import load_dotenv
from video_analyzer.frame_extractor import FrameExtractor
from video_analyzer.transcript_extractor import TranscriptExtractor
from video_analyzer.hybrid_vision_analyzer import HybridVisionAnalyzer
import json

# 환경변수 로드
load_dotenv()


def test_youtube_analysis(
    youtube_url: str,
    use_gemini: bool = True,
    use_llava: bool = False,
    max_frames: int = 5
):
    """
    YouTube 영상 분석 테스트

    Args:
        youtube_url: YouTube URL
        use_gemini: Gemini API 사용 여부
        use_llava: LLaVA 로컬 모델 사용 여부 (INT4: ~7GB VRAM)
        max_frames: 분석할 최대 프레임 수
    """
    logger.info("=" * 80)
    logger.info("🎬 YouTube 영상 분석 시작")
    logger.info("=" * 80)
    logger.info(f"📺 URL: {youtube_url}")
    logger.info(f"🔧 Gemini API: {'사용' if use_gemini else '사용 안함'}")
    logger.info(f"🦙 LLaVA 로컬: {'사용' if use_llava else '사용 안함'}")
    logger.info(f"🖼️  최대 프레임: {max_frames}개")
    logger.info()

    # Step 1: 프레임 추출
    logger.info("\n" + "=" * 80)
    logger.info("📥 STEP 1: 영상 다운로드 & 프레임 추출")
    logger.info("=" * 80)

    # 임시 디렉토리 사용 (분석 후 자동 삭제)
    import tempfile
    temp_dir = tempfile.mkdtemp(prefix="youtube_analysis_")
    logger.info(f"📁 임시 디렉토리: {temp_dir}")

    extractor = FrameExtractor(output_dir=temp_dir)

    # 영상 다운로드
    logger.info("⏬ 영상 다운로드 중...")
    video_info = extractor.download_video(youtube_url)

    if not video_info['success']:
        logger.info(f"❌ 다운로드 실패: {video_info['error']}")
        return

    logger.info(f"✅ 다운로드 완료!")
    logger.info(f"   제목: {video_info['title']}")
    logger.info(f"   채널: {video_info['channel']}")
    logger.info(f"   길이: {video_info['duration']}초")

    # 프레임 추출 (장면 전환 감지 우선)
    logger.info("\n🎞️  프레임 추출 중...")
    frame_result = extractor.extract_frames_scene_detect(
        video_path=video_info['path'],
        max_frames=max_frames
    )

    if not frame_result['success']:
        logger.info(f"❌ 프레임 추출 실패: {frame_result.get('error', 'Unknown')}")
        return

    frames = frame_result['frames']
    logger.info(f"✅ {len(frames)}개 프레임 추출 완료!")
    for i, frame in enumerate(frames, 1):
        timestamp_str = f"{int(frame['timestamp'] // 60):02d}:{int(frame['timestamp'] % 60):02d}"
        logger.info(f"   {i}. {timestamp_str} - {frame['path']}")

    # Step 2: 자막 추출
    logger.info("\n" + "=" * 80)
    logger.info("📝 STEP 2: 자막 추출")
    logger.info("=" * 80)

    transcript_result = TranscriptExtractor.get_transcript(
        url=youtube_url,
        languages=['ko', 'en']
    )

    if transcript_result['success']:
        logger.info(f"✅ 자막 추출 완료!")
        logger.info(f"   언어: {transcript_result['language']}")
        logger.info(f"   방법: {transcript_result['method']}")
        logger.info(f"   세그먼트: {len(transcript_result['segments'])}개")
        logger.info(f"\n📄 자막 미리보기 (처음 500자):")
        logger.info("-" * 80)
        logger.info(transcript_result['full_text'][:500] + "...")
        logger.info("-" * 80)
    else:
        logger.info(f"⚠️  자막 추출 실패: {transcript_result.get('error', 'Unknown')}")
        transcript_result = None

    # Step 3: 비전 분석
    logger.info("\n" + "=" * 80)
    logger.info("🔍 STEP 3: AI 비전 분석")
    logger.info("=" * 80)

    if not use_gemini and not use_llava:
        logger.info("⚠️  Gemini와 LLaVA 모두 비활성화됨. 분석을 건너뜁니다.")
        return

    # 하이브리드 분석기 초기화
    if use_gemini:
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            logger.info("⚠️  GEMINI_API_KEY가 .env에 없습니다.")
            use_gemini = False

    analyzer = HybridVisionAnalyzer(
        gemini_api_key=os.getenv("GEMINI_API_KEY") if use_gemini else None,
        llava_quantization="int4",  # 24GB VRAM에 안전
        lazy_load=True  # 필요할 때만 로드
    )

    # 각 프레임 분석
    analysis_results = []

    for i, frame in enumerate(frames, 1):
        timestamp_str = f"{int(frame['timestamp'] // 60):02d}:{int(frame['timestamp'] % 60):02d}"
        logger.info(f"\n🖼️  프레임 {i}/{len(frames)} 분석 중... ({timestamp_str})")

        # 분석 방법 결정
        if use_gemini and not use_llava:
            force_method = "gemini"
        elif use_llava and not use_gemini:
            force_method = "llava"
        else:
            force_method = "auto"

        # 자막과 함께 분석
        context = None
        if transcript_result and transcript_result['success']:
            # 해당 시간대 자막 찾기
            frame_time = frame['timestamp']
            relevant_text = []

            for seg in transcript_result['segments']:
                seg_start = seg['start']
                seg_end = seg_start + seg['duration']
                # 프레임 전후 30초 자막 포함
                if abs(seg_start - frame_time) < 30:
                    relevant_text.append(seg['text'])

            if relevant_text:
                context = " ".join(relevant_text)

        # 프롬프트 구성
        if context:
            prompt = f"""이 영상 프레임을 분석해주세요.

이 시점의 자막 내용:
{context}

다음 내용을 포함해서 설명해주세요:
1. 화면에 보이는 주요 내용
2. 텍스트나 자막이 있다면 그 내용
3. 자막과 화면의 연관성
4. 핵심 키워드 3-5개"""
        else:
            prompt = """이 영상 프레임을 분석해주세요.

다음 내용을 포함해서 설명해주세요:
1. 화면에 보이는 주요 내용
2. 텍스트나 자막이 있다면 그 내용
3. 핵심 키워드 3-5개"""

        # 분석 실행
        result = analyzer.analyze_frame(
            image_path=frame['path'],
            source="youtube",
            prompt=prompt,
            language="ko",
            force_method=force_method
        )

        if result['success']:
            logger.info(f"✅ 분석 완료 (방법: {result['method']})")
            logger.info(f"📊 분석 결과:")
            logger.info("-" * 80)
            logger.info(result['description'])
            logger.info("-" * 80)

            timestamp_str = f"{int(frame['timestamp'] // 60):02d}:{int(frame['timestamp'] % 60):02d}"
            analysis_results.append({
                'frame_number': i,
                'timestamp': timestamp_str,
                'timestamp_seconds': frame['timestamp'],
                'method': result['method'],
                'description': result['description'],
                'has_context': context is not None
            })
        else:
            logger.info(f"❌ 분석 실패: {result.get('error', 'Unknown')}")

    # Step 4: 결과 요약 및 출력
    logger.info("\n" + "=" * 80)
    logger.info("📊 STEP 4: 최종 분석 결과")
    logger.info("=" * 80)

    logger.info(f"\n📹 영상 정보:")
    logger.info(f"   제목: {video_info['title']}")
    logger.info(f"   채널: {video_info['channel']}")
    logger.info(f"   길이: {video_info['duration']}초")

    logger.info(f"\n📊 분석 통계:")
    logger.info(f"   총 프레임: {len(frames)}개")
    logger.info(f"   분석 성공: {len(analysis_results)}개")
    logger.info(f"   자막 포함: {'예' if (transcript_result and transcript_result['success']) else '아니오'}")

    if transcript_result and transcript_result['success']:
        logger.info(f"\n📝 자막 전체 내용:")
        logger.info("=" * 80)
        logger.info(transcript_result['full_text'])
        logger.info("=" * 80)

    if analysis_results:
        logger.info(f"\n🔍 프레임별 AI 분석 결과:")
        logger.info("=" * 80)
        for result in analysis_results:
            logger.info(f"\n[프레임 {result['frame_number']}] {result['timestamp']}")
            logger.info(f"분석 방법: {result['method']}")
            logger.info(f"자막 연계: {'예' if result['has_context'] else '아니오'}")
            logger.info("-" * 80)
            logger.info(result['description'])
            logger.info("-" * 80)

    logger.info("\n" + "=" * 80)
    logger.info("✅ 분석 완료!")
    logger.info("=" * 80)

    # 임시 파일 정리
    logger.info(f"\n🗑️  임시 파일 삭제 중...")
    import shutil
    try:
        shutil.rmtree(temp_dir)
        logger.info(f"✅ 임시 디렉토리 삭제 완료: {temp_dir}")
    except Exception as e:
        logger.info(f"⚠️  임시 파일 삭제 실패: {e}")


if __name__ == "__main__":
    import sys

    # 사용 예시
    logger.info("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     YouTube 영상 분석 테스트 스크립트                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

사용법:
    python test_youtube_analyzer.py <YouTube_URL> [옵션]

옵션:
    --gemini     : Gemini API 사용 (기본값: True)
    --llava      : LLaVA 로컬 모델 사용 (VRAM ~7GB)
    --no-gemini  : Gemini API 사용 안함
    --frames N   : 분석할 최대 프레임 수 (기본값: 5)

예시:
    # Gemini API로 분석 (빠름, API 필요)
    python test_youtube_analyzer.py "https://www.youtube.com/watch?v=VIDEO_ID"

    # LLaVA 로컬 모델로 분석 (느림, 무료)
    python test_youtube_analyzer.py "https://www.youtube.com/watch?v=VIDEO_ID" --llava --no-gemini

    # 프레임 3개만 분석
    python test_youtube_analyzer.py "https://www.youtube.com/watch?v=VIDEO_ID" --frames 3

필수 환경변수 (.env):
    GEMINI_API_KEY=your_api_key_here  # Gemini 사용시 필요
    """)

    if len(sys.argv) < 2:
        logger.info("\n❌ YouTube URL을 입력해주세요!")
        logger.info("예시: python test_youtube_analyzer.py 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'\n")
        sys.exit(1)

    # 인자 파싱
    youtube_url = sys.argv[1]
    use_gemini = "--no-gemini" not in sys.argv
    use_llava = "--llava" in sys.argv

    max_frames = 5
    if "--frames" in sys.argv:
        idx = sys.argv.index("--frames")
        if idx + 1 < len(sys.argv):
            max_frames = int(sys.argv[idx + 1])

    # 실행
    test_youtube_analysis(
        youtube_url=youtube_url,
        use_gemini=use_gemini,
        use_llava=use_llava,
        max_frames=max_frames
    )
