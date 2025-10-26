# 프로젝트 구조

```
ai/
├── src/                              # 📦 소스 코드
│   ├── api/                          # 🌐 FastAPI 서버
│   │   ├── __init__.py
│   │   ├── main.py                   # API 서버 메인 파일
│   │   └── models.py                 # Pydantic 데이터 모델
│   │
│   ├── core/                         # 🧠 핵심 분석 로직
│   │   ├── __init__.py
│   │   ├── frame_extractor.py        # 영상 다운로드 & 프레임 추출
│   │   ├── transcript_extractor.py   # 자막 추출
│   │   ├── llama_vision_analyzer.py  # Llama 3.2 Vision 분석
│   │   └── llama_text_analyzer.py    # Llama 3.1 Text 분석
│   │
│   └── utils/                        # 🔧 유틸리티
│       └── __init__.py
│
├── tests/                            # 🧪 테스트 파일
│   ├── test_api.py                   # API 테스트 스크립트
│   ├── test_llama_video_analyzer.py  # 전체 파이프라인 테스트
│   └── legacy/                       # 구버전 테스트 파일
│       ├── llama_3_1_8b_test.py
│       ├── test_youtube_analyzer.py
│       └── test_youtube_analyzer_hybrid.py
│
├── scripts/                          # 🚀 실행 스크립트
│   └── run_server.sh                 # API 서버 실행 스크립트
│
├── docs/                             # 📚 문서
│   ├── README.md                     # 상세 문서
│   └── API_GUIDE.md                  # API 사용 가이드
│
├── deprecated/                       # 🗄️ 사용 중단된 코드
│   └── old_analyzers/                # 구버전 분석기
│       ├── _deprecated_vision_analyzer.py      # Gemini Vision
│       ├── _deprecated_llava_analyzer.py       # LLaVA
│       └── _deprecated_hybrid_vision_analyzer.py
│
├── .env.example                      # 📝 환경변수 예시
├── .env                              # 🔐 환경변수 (gitignore)
├── .gitignore                        # 🚫 Git 제외 파일
├── requirements.txt                  # 📦 Python 의존성
├── README.md                         # 📖 메인 README
└── STRUCTURE.md                      # 📁 이 파일
```

---

## 📂 디렉토리 설명

### `src/` - 소스 코드
모든 프로덕션 코드가 위치합니다.

#### `src/api/` - FastAPI 서버
- **main.py**: FastAPI 앱 정의, 라우트, 백그라운드 작업 처리
- **models.py**: Pydantic 모델 (요청/응답 스키마)

#### `src/core/` - 핵심 분석 로직
- **frame_extractor.py**: YouTube 다운로드 + 프레임 추출 (yt-dlp, OpenCV, PySceneDetect)
- **transcript_extractor.py**: 자막 추출 (YouTube Transcript API)
- **llama_vision_analyzer.py**: Llama 3.2 11B Vision 이미지 분석
- **llama_text_analyzer.py**: Llama 3.1 8B 텍스트 요약/합성

#### `src/utils/` - 유틸리티
향후 확장용 (현재 비어있음)

---

### `tests/` - 테스트 파일
개발 및 테스트용 스크립트

- **test_api.py**: API 서버 테스트 (cURL 대체)
- **test_llama_video_analyzer.py**: 전체 파이프라인 테스트 (CLI)
- **legacy/**: 구버전 테스트 파일 (Gemini, LLaVA 시절)

---

### `scripts/` - 실행 스크립트
편의 스크립트 모음

- **run_server.sh**: API 서버 실행 (환경변수 로드 포함)

---

### `docs/` - 문서
프로젝트 문서

- **README.md**: 상세 기술 문서
- **API_GUIDE.md**: API 사용 가이드 (엔드포인트, 예시)

---

### `deprecated/` - 사용 중단 코드
과거 버전 코드 보관 (삭제 예정)

- **old_analyzers/**: Gemini Vision, LLaVA, Hybrid 분석기

---

## 🔄 Import 경로

### API에서 core 모듈 사용
```python
from src.core import (
    FrameExtractor,
    TranscriptExtractor,
    LlamaVisionAnalyzer,
    LlamaTextAnalyzer
)
```

### 테스트에서 core 모듈 사용
```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core import FrameExtractor
```

---

## 🚀 실행 방법

### API 서버 실행
```bash
# 프로젝트 루트에서
./scripts/run_server.sh

# 또는
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

### 파이프라인 테스트
```bash
cd tests
python test_llama_video_analyzer.py
```

### API 테스트
```bash
# 서버 실행 후
cd tests
python test_api.py
```

---

## 📝 파일 관계도

```
YouTube URL
    ↓
[FrameExtractor] → 영상 다운로드 & 프레임 추출
[TranscriptExtractor] → 자막 추출
    ↓
[LlamaVisionAnalyzer] → 각 프레임 시각 분석
    ↓
[LlamaTextAnalyzer] → 종합 요약 생성
    ↓
결과 (JSON/Text)
```

---

## 🔧 확장 포인트

### 새로운 분석기 추가
`src/core/new_analyzer.py` 생성 후 `__init__.py`에 export

### 새로운 API 엔드포인트
`src/api/main.py`에 라우트 추가

### 유틸리티 함수
`src/utils/` 아래에 모듈 추가

---

## ⚠️ 주의사항

1. **절대 경로 사용 금지**: 모든 import는 상대 경로 또는 `src.*` 형식
2. **환경변수**: `.env` 파일은 gitignore에 포함 (`.env.example` 참고)
3. **구버전 코드**: `deprecated/` 폴더의 코드는 사용하지 않음
4. **테스트 실행**: 항상 프로젝트 루트에서 실행

---

## 📌 TODO

- [ ] `src/utils/` 유틸리티 함수 추가
- [ ] Redis 기반 작업 저장소 구현 (현재는 메모리)
- [ ] API 인증/권한 추가
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축
