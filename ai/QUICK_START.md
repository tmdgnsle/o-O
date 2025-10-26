# 🚀 Quick Start Guide

## 1️⃣ 설치 (5분)

```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어서 HUGGINGFACE_TOKEN 설정

# 3. HuggingFace 로그인
huggingface-cli login
```

---

## 2️⃣ API 서버 실행 (10초)

```bash
./scripts/run_server.sh
```

**서버 주소**:
- API: http://localhost:8000
- 문서: http://localhost:8000/docs

---

## 3️⃣ API 사용 (30초)

### 터미널에서

```bash
# 영상 분석 요청
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "max_frames": 8}'

# 응답에서 task_id 확인
# {"task_id": "550e8400-e29b-...", "status": "pending"}

# 작업 상태 조회
curl "http://localhost:8000/tasks/{task_id}"
```

### Python에서

```python
import requests, time

# 분석 시작
resp = requests.post("http://localhost:8000/analyze", json={
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "max_frames": 8
})
task_id = resp.json()["task_id"]

# 완료 대기
while True:
    result = requests.get(f"http://localhost:8000/tasks/{task_id}").json()
    if result["status"] == "completed":
        print("✅ 완료!")
        print(result["summary"])
        break
    print(f"진행 중: {result['status']}")
    time.sleep(5)
```

---

## 4️⃣ 테스트 (1분)

```bash
cd tests
python test_api.py
```

---

## 📚 더 알아보기

- **상세 문서**: [README.md](README.md)
- **API 가이드**: [docs/API_GUIDE.md](docs/API_GUIDE.md)
- **프로젝트 구조**: [STRUCTURE.md](STRUCTURE.md)

---

## ⚠️ 문제 해결

### "CUDA out of memory"
```bash
# INT4 양자화 사용 (기본값)
# max_frames 줄이기
curl -X POST "http://localhost:8000/analyze" \
  -d '{"youtube_url": "...", "max_frames": 4}'
```

### "YouTube download failed"
```bash
# yt-dlp 업데이트
pip install -U yt-dlp

# 프록시 사용 (지역 제한 영상)
curl -X POST "http://localhost:8000/analyze" \
  -d '{"youtube_url": "...", "proxy": "socks5://127.0.0.1:9050"}'
```

### "Import error"
```bash
# 프로젝트 루트에서 실행 확인
cd /workspace/S13P31D202/ai
python -m uvicorn src.api.main:app
```
