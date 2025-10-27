# filename: gms_chat_stream_env_check.py
import os
import json
import time
import requests
from dotenv import load_dotenv

# 1) .env 로드
load_dotenv()
GMS_KEY = os.getenv("GMS_KEY")
if not GMS_KEY:
    print("❌ .env에 GMS_KEY가 없습니다. (예: GMS_KEY=xxxxx)")
    exit(1)

API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GMS_KEY}",
    "Content-Type": "application/json",
}

messages = [
    {"role": "developer", "content": "Answer in Korean"}
]


def warn_if_not_streaming(resp_headers, first_event_latency_s, event_count, char_count):
    """스트리밍이 아닐 가능성을 여러 기준으로 판단해 경고 출력"""
    # 기준 1: Content-Type
    ct = resp_headers.get("Content-Type", "")
    is_sse = "text/event-stream" in ct

    # 기준 2: 첫 토큰 도착까지 지연
    long_first_latency = first_event_latency_s is None or first_event_latency_s > 1.5

    # 기준 3: 이벤트 개수
    few_events = event_count <= 1

    # 기준 4: 글자 수 대비 이벤트 수 (너무 길면 원샷일 가능성)
    suspicious_bulk = char_count > 200 and event_count < 3

    if not is_sse or (long_first_latency and (few_events or suspicious_bulk)):
        print("\n⚠️ 스트리밍이 비활성 상태일 수 있습니다.")
        print(f"   - Content-Type: {ct or 'N/A'}")
        if first_event_latency_s is not None:
            print(f"   - 첫 이벤트 대기 시간: {first_event_latency_s:.2f}s")
        else:
            print("   - 첫 이벤트 대기 시간: 이벤트 미수신")
        print(f"   - 이벤트 수: {event_count}")
        print(f"   - 수신 글자 수: {char_count}")
        print("   - 원인 추정: 프록시가 SSE를 병합하거나 버퍼링했을 수 있음(GMS/네트워크 환경 확인).")


print("🚀 GMS Chat Stream 시작 (Ctrl+C로 종료)\n")

while True:
    try:
        user_input = input("🧑‍💻 질문 > ").strip()
        if not user_input:
            continue

        messages.append({"role": "user", "content": user_input})

        payload = {
            "model": "gpt-5-nano",
            "stream": True,
            "messages": messages
        }

        print("🤖 답변 > ", end="", flush=True)

        t0 = time.time()
        first_event_latency = None
        event_count = 0
        char_count = 0
        full_reply = ""

        with requests.post(API_URL, headers=HEADERS, json=payload, stream=True, timeout=300) as resp:
            # HTTP 에러 즉시 표시
            if resp.status_code != 200:
                print(f"\n❌ 오류 {resp.status_code}: {resp.text}")
                continue

            # 스트림 수신 루프
            for line in resp.iter_lines(decode_unicode=True):
                if not line or not line.startswith("data:"):
                    continue

                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    break

                if first_event_latency is None:
                    first_event_latency = time.time() - t0

                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0]["delta"]
                    piece = delta.get("content")
                    if piece:
                        print(piece, end="", flush=True)
                        full_reply += piece
                        char_count += len(piece)
                        event_count += 1
                except Exception:
                    # 파싱 실패시 무시 (간헐적 개행/프록시 이슈 대비)
                    continue

        print("\n")
        # 스트리밍 상태 자동 진단
        warn_if_not_streaming(
            resp.headers, first_event_latency, event_count, char_count)

        # 대화 맥락 유지
        if full_reply:
            messages.append({"role": "assistant", "content": full_reply})

    except KeyboardInterrupt:
        print("\n👋 종료합니다.")
        break
    except Exception as e:
        print(f"\n⚠️ 예외 발생: {e}")
