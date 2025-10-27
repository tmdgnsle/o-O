import os
import json
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

GMS_KEY = os.getenv("GMS_KEY")
if not GMS_KEY:
    print("❌ .env 파일에 GMS_KEY가 없습니다. (.env 예시: GMS_KEY=xxxxx)")
    exit(1)

API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GMS_KEY}",
    "Content-Type": "application/json",
}

messages = [
    {"role": "developer", "content": "Answer in Korean"}
]

print("🚀 GMS Chat Stream 시작 (끝내려면 Ctrl+C)\n")

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

        with requests.post(API_URL, headers=HEADERS, json=payload, stream=True, timeout=300) as resp:
            if resp.status_code != 200:
                print(f"\n❌ 오류 {resp.status_code}: {resp.text}")
                continue

            full_reply = ""
            for line in resp.iter_lines(decode_unicode=True):
                if not line or not line.startswith("data:"):
                    continue
                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    break

                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0]["delta"]
                    if "content" in delta:
                        content_piece = delta["content"]
                        print(content_piece, end="", flush=True)
                        full_reply += content_piece
                except Exception:
                    continue

            print("\n")
            messages.append({"role": "assistant", "content": full_reply})

    except KeyboardInterrupt:
        print("\n👋 종료합니다.")
        break
    except Exception as e:
        print(f"\n⚠️ 예외 발생: {e}")
