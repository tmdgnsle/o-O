"""
텍스트 분석 API 테스트 스크립트
"""
import requests
import json


def test_text_analysis_streaming():
    """텍스트 분석 스트리밍 API 테스트"""

    API_URL = "http://localhost:8000"

    print("=" * 80)
    print("텍스트 마인드맵 생성 API 테스트")
    print("=" * 80)
    print()

    # 테스트 케이스
    test_cases = [
        {
            "name": "간단한 주제 (Simple)",
            "text_prompt": "인공지능의 역사",
            "detail_level": "simple"
        },
        {
            "name": "중간 복잡도 (Medium)",
            "text_prompt": "블록체인 기술의 원리와 응용 분야",
            "detail_level": "medium"
        },
        {
            "name": "상세한 분석 (Detailed)",
            "text_prompt": "기후 변화의 원인, 영향, 그리고 해결 방안을 다각도로 분석",
            "detail_level": "detailed"
        }
    ]

    # 사용자가 테스트 케이스 선택
    print("테스트 케이스를 선택하세요:")
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. {case['name']}")
        print(f"   주제: {case['text_prompt']}")
        print(f"   상세도: {case['detail_level']}")
        print()

    choice = input("선택 (1-3) 또는 Enter로 직접 입력: ").strip()

    if choice in ['1', '2', '3']:
        selected_case = test_cases[int(choice) - 1]
        text_prompt = selected_case['text_prompt']
        detail_level = selected_case['detail_level']
    else:
        text_prompt = input("분석할 텍스트/주제를 입력하세요: ").strip()
        if not text_prompt:
            text_prompt = "인공지능의 역사와 발전 과정"

        detail_level = input("상세 수준 (simple/medium/detailed, 기본=medium): ").strip()
        if not detail_level or detail_level not in ['simple', 'medium', 'detailed']:
            detail_level = "medium"

    print()
    print("=" * 80)
    print(f"주제: {text_prompt}")
    print(f"상세도: {detail_level}")
    print("=" * 80)
    print()

    # 요청 데이터
    request_data = {
        "text_prompt": text_prompt,
        "detail_level": detail_level
    }

    print("요청 전송 중...")
    print(f"Request: {json.dumps(request_data, indent=2, ensure_ascii=False)}")
    print()

    try:
        # 스트리밍 요청
        response = requests.post(
            f"{API_URL}/analyze/text",
            json=request_data,
            stream=True,
            timeout=120  # 2분 타임아웃
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

            # 마인드맵
            if 'mindmap' in final_result:
                print("\n🗺️ 마인드맵 구조:")
                mindmap = final_result['mindmap']

                def print_mindmap(node, indent=0):
                    prefix = "  " * indent
                    keyword = node.get('keyword', '')
                    description = node.get('description', '')

                    print(f"{prefix}📌 {keyword}")
                    if description and len(description) < 100:
                        print(f"{prefix}   → {description}")
                    elif description:
                        print(f"{prefix}   → {description[:100]}...")

                    children = node.get('children')
                    if children:
                        for child in children:
                            print_mindmap(child, indent + 1)

                print_mindmap(mindmap)

                # 통계
                def count_nodes(node):
                    count = 1
                    if node.get('children'):
                        for child in node['children']:
                            count += count_nodes(child)
                    return count

                def max_depth(node, current_depth=0):
                    if not node.get('children'):
                        return current_depth
                    return max(max_depth(child, current_depth + 1) for child in node['children'])

                total_nodes = count_nodes(mindmap)
                depth = max_depth(mindmap)

                print(f"\n📊 마인드맵 통계:")
                print(f"  - 전체 노드 수: {total_nodes}")
                print(f"  - 최대 깊이: {depth + 1}단계")
                print(f"  - 루트 자식 수: {len(mindmap.get('children', []))}")

            print("\n✅ 테스트 완료!")
            print("\n💡 Tip: 브라우저에서 static/test_text_stream.html을 열어 시각화된 마인드맵을 확인하세요!")

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

            if not health.get('text_model_loaded'):
                print("\n⚠️  경고: Text 모델이 로드되지 않았습니다.")
                print("서버를 재시작해주세요.")
        else:
            print("\n⚠️  서버 상태 확인 필요")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ 헬스 체크 실패: {e}")
        print("서버가 실행 중인지 확인하세요: http://localhost:8000")


def test_api_info():
    """API 정보 확인"""
    API_URL = "http://localhost:8000"

    print("\n" + "=" * 80)
    print("API 정보")
    print("=" * 80)

    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        response.raise_for_status()

        info = response.json()
        print(json.dumps(info, indent=2, ensure_ascii=False))

    except requests.exceptions.RequestException as e:
        print(f"\n❌ API 정보 조회 실패: {e}")


if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║          Text to MindMap API 테스트 스크립트                  ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    # API 정보 확인
    test_api_info()

    # 헬스 체크
    test_health_check()

    # 텍스트 분석 테스트
    print("\n")
    user_input = input("텍스트 마인드맵 생성 테스트를 시작하시겠습니까? (y/n): ")

    if user_input.lower() == 'y':
        test_text_analysis_streaming()
    else:
        print("테스트를 건너뜁니다.")
