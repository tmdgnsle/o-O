"""
이미지 분석 API 테스트 스크립트
"""
import requests
import json
import time


def test_image_analysis_streaming():
    """이미지 분석 스트리밍 API 테스트"""

    API_URL = "http://localhost:8000"

    # 테스트 이미지 URL (Unsplash 무료 이미지)
    test_image_url = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800"

    print("=" * 80)
    print("이미지 분석 API 테스트 시작")
    print("=" * 80)
    print(f"이미지 URL: {test_image_url}")
    print()

    # 요청 데이터
    request_data = {
        "image_url": test_image_url,
        "user_prompt": "이 이미지의 주요 요소들을 분석하고 분류해주세요"
    }

    print("요청 전송 중...")
    print(f"Request: {json.dumps(request_data, indent=2, ensure_ascii=False)}")
    print()

    try:
        # 스트리밍 요청
        response = requests.post(
            f"{API_URL}/analyze/image",
            json=request_data,
            stream=True,
            timeout=300  # 5분 타임아웃
        )

        response.raise_for_status()

        print("스트리밍 응답 수신 중...")
        print("-" * 80)

        final_result = None

        # SSE 스트림 파싱
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')

                if line_str.startswith('data: '):
                    data_str = line_str[6:]

                    try:
                        data = json.loads(data_str)

                        # 진행 상황 출력
                        status = data.get('status', 'unknown')
                        progress = data.get('progress', 0)
                        message = data.get('message', '')

                        print(f"[{progress:3d}%] {status:20s} - {message}")

                        # 최종 결과 저장
                        if status == 'completed' and 'result' in data:
                            final_result = data['result']

                        # 에러 처리
                        if status == 'failed':
                            error = data.get('error', 'Unknown error')
                            print(f"\n❌ 에러 발생: {error}")
                            return

                    except json.JSONDecodeError as e:
                        print(f"JSON 파싱 에러: {e}")
                        print(f"원본 데이터: {data_str[:200]}")

        print("-" * 80)

        if final_result:
            print("\n" + "=" * 80)
            print("최종 결과")
            print("=" * 80)

            # 이미지 정보
            if 'image_info' in final_result:
                print("\n📊 이미지 정보:")
                info = final_result['image_info']
                print(f"  - Format: {info.get('format')}")
                print(f"  - Size: {info.get('width')} x {info.get('height')}")
                print(f"  - Mode: {info.get('mode')}")

            # 분석 결과
            if 'analysis' in final_result:
                print("\n🔍 분석 결과:")
                print(f"  {final_result['analysis'][:500]}")
                if len(final_result['analysis']) > 500:
                    print("  ...")

            # 마인드맵
            if 'mindmap' in final_result:
                print("\n🗺️ 마인드맵:")
                mindmap = final_result['mindmap']
                print(f"  Root: {mindmap.get('keyword')}")
                print(f"  Description: {mindmap.get('description', '')[:100]}")

                if mindmap.get('children'):
                    print(f"  Children: {len(mindmap['children'])} nodes")
                    for i, child in enumerate(mindmap['children'][:3], 1):
                        print(f"    {i}. {child.get('keyword')}")
                    if len(mindmap['children']) > 3:
                        print(f"    ... and {len(mindmap['children']) - 3} more")

            print("\n✅ 테스트 완료!")

        else:
            print("\n⚠️  최종 결과를 받지 못했습니다.")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ 요청 에러: {e}")
    except Exception as e:
        print(f"\n❌ 예상치 못한 에러: {e}")
        import traceback
        traceback.print_exc()


def test_health_check():
    """헬스 체크 테스트"""
    API_URL = "http://localhost:8000"

    print("\n" + "=" * 80)
    print("헬스 체크 테스트")
    print("=" * 80)

    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        response.raise_for_status()

        health = response.json()
        print(json.dumps(health, indent=2, ensure_ascii=False))

        if health.get('status') == 'healthy':
            print("\n✅ 서버 정상 작동 중")
        else:
            print("\n⚠️  서버 상태 확인 필요")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ 헬스 체크 실패: {e}")
        print("서버가 실행 중인지 확인하세요: http://localhost:8000")


if __name__ == "__main__":
    # 먼저 헬스 체크
    test_health_check()

    # 이미지 분석 테스트
    print("\n")
    user_input = input("이미지 분석 테스트를 시작하시겠습니까? (y/n): ")

    if user_input.lower() == 'y':
        test_image_analysis_streaming()
    else:
        print("테스트를 건너뜁니다.")
