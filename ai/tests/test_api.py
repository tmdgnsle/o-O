"""
API 테스트 스크립트
"""
import requests
import time
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)

API_BASE_URL = "http://localhost:8000"


def test_health_check():
    """헬스 체크 테스트"""
    logger.info("=" * 80)
    logger.info("🏥 헬스 체크")
    logger.info("=" * 80)

    response = requests.get(f"{API_BASE_URL}/health")
    logger.info(f"Status Code: {response.status_code}")
    logger.info(json.dumps(response.json(), indent=2, ensure_ascii=False))
    logger.info()


def test_analyze_video(youtube_url: str):
    """영상 분석 테스트"""
    logger.info("=" * 80)
    logger.info("🎬 영상 분석 시작")
    logger.info("=" * 80)

    # 분석 요청
    payload = {
        "youtube_url": youtube_url,
        "max_frames": 8,
        "vision_quantization": "int4",
        "text_quantization": "int4"
    }

    response = requests.post(f"{API_BASE_URL}/analyze/youtube", json=payload)

    if response.status_code != 200:
        logger.info(f"❌ 요청 실패: {response.status_code}")
        logger.info(response.text)
        return None

    result = response.json()
    task_id = result['task_id']

    logger.info(f"✅ 작업 생성 완료")
    logger.info(f"📋 Task ID: {task_id}")
    logger.info(f"📊 상태: {result['status']}")
    logger.info(f"💬 메시지: {result['message']}\n")

    return task_id


def test_get_task_status(task_id: str):
    """작업 상태 조회"""
    logger.info("=" * 80)
    logger.info(f"📊 작업 상태 조회: {task_id}")
    logger.info("=" * 80)

    response = requests.get(f"{API_BASE_URL}/tasks/{task_id}")

    if response.status_code != 200:
        logger.info(f"❌ 조회 실패: {response.status_code}")
        return None

    result = response.json()
    logger.info(f"📋 Task ID: {result['task_id']}")
    logger.info(f"📊 상태: {result['status']}")
    logger.info(f"🔗 URL: {result['youtube_url']}")
    logger.info(f"📅 생성 시각: {result['created_at']}")

    if result.get('completed_at'):
        logger.info(f"✅ 완료 시각: {result['completed_at']}")

    if result.get('video_info'):
        logger.info(f"\n📺 영상 정보:")
        logger.info(f"  - 제목: {result['video_info'].get('title')}")
        logger.info(f"  - 길이: {result['video_info'].get('duration')}초")
        logger.info(f"  - 채널: {result['video_info'].get('channel')}")

    if result.get('error'):
        logger.info(f"\n❌ 에러: {result['error']}")

    logger.info()
    return result


def test_wait_for_completion(task_id: str, timeout: int = 600):
    """작업 완료 대기"""
    logger.info("=" * 80)
    logger.info(f"⏳ 작업 완료 대기: {task_id}")
    logger.info("=" * 80)

    start_time = time.time()
    last_status = None

    while True:
        elapsed = time.time() - start_time

        if elapsed > timeout:
            logger.info(f"\n❌ 타임아웃 ({timeout}초)")
            return None

        response = requests.get(f"{API_BASE_URL}/tasks/{task_id}")
        if response.status_code != 200:
            logger.info(f"❌ 조회 실패: {response.status_code}")
            return None

        result = response.json()
        current_status = result['status']

        # 상태가 변경되면 출력
        if current_status != last_status:
            logger.info(f"[{elapsed:.0f}s] 상태: {current_status}")
            last_status = current_status

        # 완료 또는 실패
        if current_status == "completed":
            logger.info(f"\n✅ 작업 완료! (총 {elapsed:.0f}초 소요)")
            return result
        elif current_status == "failed":
            logger.info(f"\n❌ 작업 실패: {result.get('error')}")
            return result

        time.sleep(5)  # 5초마다 체크


def test_show_result(result: dict):
    """결과 출력"""
    logger.info("\n" + "=" * 80)
    logger.info("📊 분석 결과")
    logger.info("=" * 80)

    logger.info(f"\n📺 영상 URL: {result['youtube_url']}")

    if result.get('video_info'):
        logger.info(f"\n📹 영상 정보:")
        logger.info(f"  - 제목: {result['video_info'].get('title')}")
        logger.info(f"  - 길이: {result['video_info'].get('duration')}초")
        logger.info(f"  - 채널: {result['video_info'].get('channel')}")

    if result.get('summary'):
        logger.info("\n" + "-" * 80)
        logger.info("📝 종합 요약")
        logger.info("-" * 80)
        logger.info(result['summary'])

    if result.get('key_points'):
        logger.info("\n" + "-" * 80)
        logger.info("🔑 핵심 포인트")
        logger.info("-" * 80)
        for i, point in enumerate(result['key_points'], 1):
            logger.info(f"{i}. {point}")

    if result.get('frame_analyses'):
        logger.info("\n" + "-" * 80)
        logger.info(f"🖼️  프레임 분석 ({len(result['frame_analyses'])}개)")
        logger.info("-" * 80)
        for i, analysis in enumerate(result['frame_analyses'], 1):
            logger.info(f"\n[프레임 {i}]")
            logger.info(analysis[:300] + ("..." if len(analysis) > 300 else ""))

    if result.get('transcript'):
        logger.info("\n" + "-" * 80)
        logger.info("📄 자막")
        logger.info("-" * 80)
        transcript = result['transcript']
        logger.info(transcript[:500] + ("..." if len(transcript) > 500 else ""))

    logger.info("\n" + "=" * 80)


def test_list_tasks():
    """작업 목록 조회"""
    logger.info("=" * 80)
    logger.info("📋 작업 목록 조회")
    logger.info("=" * 80)

    response = requests.get(f"{API_BASE_URL}/tasks")

    if response.status_code != 200:
        logger.info(f"❌ 조회 실패: {response.status_code}")
        return

    result = response.json()
    logger.info(f"총 작업 수: {result['total']}\n")

    for task in result['tasks']:
        logger.info(f"📋 {task['task_id'][:8]}... | {task['status']:20} | {task['created_at']}")

    logger.info()


def main():
    """메인 테스트"""
    logger.info("\n" + "=" * 80)
    logger.info("🧪 YouTube Video Analysis API 테스트")
    logger.info("=" * 80 + "\n")

    # 1. 헬스 체크
    test_health_check()

    # 2. YouTube URL 입력
    youtube_url = input("YouTube URL을 입력하세요 (Enter를 누르면 예시 사용): ").strip()
    if not youtube_url:
        youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        logger.info(f"예시 URL 사용: {youtube_url}\n")

    # 3. 분석 시작
    task_id = test_analyze_video(youtube_url)
    if not task_id:
        return

    # 4. 작업 완료 대기
    result = test_wait_for_completion(task_id, timeout=600)

    if not result:
        return

    # 5. 결과 출력
    if result['status'] == 'completed':
        test_show_result(result)

    # 6. 작업 목록 조회
    test_list_tasks()

    logger.info("\n✅ 테스트 완료!\n")


if __name__ == "__main__":
    main()
