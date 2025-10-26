# YouTube 영상 분석 AI 시스템

Llama 3.2 Vision과 Llama 3.1을 활용한 YouTube 영상 자동 분석 시스템

## 개요

YouTube 영상을 다운로드하고, 주요 프레임 추출, 자막/음성 분석, 비전 AI 분석을 통해 종합적인 요약 리포트를 자동으로 생성합니다.

## 주요 기능

- **영상 다운로드**: yt-dlp를 통한 YouTube 영상 다운로드
- **지능형 프레임 추출**: PySceneDetect를 활용한 장면 전환 기반 프레임 선택
- **자막 추출**: YouTube 자막 API + Whisper 음성 인식 fallback
- **이미지 분석**: Llama 3.2 11B Vision을 통한 프레임별 시각 분석
- **종합 요약**: Llama 3.1 8B를 통한 텍스트 합성 및 요약
- **마크다운 리포트**: 분석 결과를 읽기 쉬운 마크다운 형식으로 출력

## 기술 스택

### AI 모델

| 모델 | 용도 | VRAM (INT4) |
|------|------|-------------|
| **Llama 3.2 11B Vision** | 이미지 분석 | ~10GB |
| **Llama 3.1 8B** | 텍스트 요약 | ~4GB |

### 핵심 라이브러리

- **PyTorch 2.5.1** (CUDA 12.1)
- **Transformers 4.57.1**
- **BitsAndBytes** (INT4/INT8 양자화)
- **yt-dlp** (YouTube 다운로드)
- **OpenCV + PySceneDetect** (프레임 추출)
- **OpenAI Whisper** (음성 인식)

## 설치

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

`.env` 파일 생성:

```env
HUGGINGFACE_TOKEN=your_huggingface_token_here
```

HuggingFace 토큰은 [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)에서 발급받으세요.

**중요**: Llama 모델은 Meta의 라이선스 동의가 필요합니다.
- [Llama 3.2 11B Vision](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct)
- [Llama 3.1 8B](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)

각 모델 페이지에서 "Request access" 버튼을 클릭하여 승인받으세요.

### 3. GPU 요구사항

- **최소**: RTX 3090 24GB (INT4 양자화)
- **권장**: RTX A5000 24GB 이상
- **CUDA**: 12.1 이상

VRAM이 부족한 경우:
- Vision과 Text 모델이 순차적으로 실행되므로 피크 메모리는 ~10GB입니다
- 더 낮은 VRAM 환경에서는 한 번에 하나의 모델만 로드됩니다

## 사용법

### 기본 사용

```bash
python test_llama_video_analyzer.py
```

프롬프트에 YouTube URL 입력:

```
YouTube URL을 입력하세요: https://www.youtube.com/watch?v=XXXXXXXXX
```

### 프로그래밍 방식 사용

```python
from test_llama_video_analyzer import analyze_youtube_video

result = analyze_youtube_video(
    youtube_url="https://www.youtube.com/watch?v=XXXXXXXXX",
    output_dir="output",
    max_frames=8,
    vision_quantization="int4",
    text_quantization="int4"
)

print(f"리포트 경로: {result['report_path']}")
```

### 개별 모듈 사용

```python
from video_analyzer import (
    FrameExtractor,
    TranscriptExtractor,
    LlamaVisionAnalyzer,
    LlamaTextAnalyzer
)

# 1. 프레임 추출
extractor = FrameExtractor()
video_path = extractor.download_youtube_video(url)
frames = extractor.extract_frames(video_path, max_frames=10)

# 2. 자막 추출
transcript_extractor = TranscriptExtractor()
transcript = transcript_extractor.extract(url)

# 3. 이미지 분석
vision = LlamaVisionAnalyzer(quantization="int4")
analysis = vision.analyze_image("frame.jpg", "이 이미지를 설명해주세요")

# 4. 텍스트 요약
text = LlamaTextAnalyzer(quantization="int4")
summary = text.summarize_video(frame_analyses, transcript)
```

## 프로젝트 구조

```
ai/
├── video_analyzer/              # 핵심 라이브러리
│   ├── __init__.py
│   ├── frame_extractor.py       # 영상 다운로드 및 프레임 추출
│   ├── transcript_extractor.py  # 자막/음성 추출
│   ├── llama_vision_analyzer.py # Llama 3.2 Vision 분석기
│   └── llama_text_analyzer.py   # Llama 3.1 텍스트 분석기
├── test_llama_video_analyzer.py # 전체 파이프라인 테스트
├── requirements.txt             # 의존성 목록
└── VRAM_MEMORY_REQUIREMENTS.md  # 메모리 프로파일링
```

## 분석 파이프라인

```
YouTube URL
    ↓
[1] 영상 다운로드 (yt-dlp)
    ↓
[2] 프레임 추출 (OpenCV + PySceneDetect)
    ↓
[3] 자막 추출 (YouTube API / Whisper)
    ↓
[4] 프레임 시각 분석 (Llama 3.2 11B Vision)
    ↓
[5] 종합 요약 생성 (Llama 3.1 8B)
    ↓
[6] 마크다운 리포트 저장
```

## 출력 결과

### 디렉토리 구조

```
output/
├── video.mp4                    # 다운로드한 영상
├── frame_0001.jpg               # 추출된 프레임들
├── frame_0002.jpg
├── ...
└── analysis_report.md           # 분석 리포트
```

### 리포트 구성

- **영상 정보**: URL, 프레임 수, 자막 길이
- **종합 요약**: AI가 생성한 영상 전체 요약
- **핵심 포인트**: 주요 내용 5가지
- **프레임별 시각 분석**: 각 프레임에 대한 상세 설명
- **전체 자막**: 영상의 전체 자막 텍스트

## 성능 최적화

### 양자화 옵션

| 모드 | VRAM | 품질 | 속도 |
|------|------|------|------|
| `int4` | 최소 | 양호 | 빠름 ⭐ |
| `int8` | 중간 | 좋음 | 중간 |
| `fp16` | 최대 | 최고 | 느림 |

권장: **INT4** (품질/속도 균형)

### 메모리 최적화 팁

1. **순차 실행**: Vision과 Text 모델을 순차적으로 로드하여 메모리 절약
2. **프레임 수 조절**: `max_frames` 매개변수로 분석 프레임 수 제한
3. **배치 크기**: 프레임을 개별적으로 분석하여 안정성 확보
4. **메모리 정리**: 각 단계 후 `cleanup()` 호출 및 `torch.cuda.empty_cache()`

## 문제 해결

### CUDA Out of Memory

```python
# max_frames 줄이기
result = analyze_youtube_video(url, max_frames=5)

# 또는 더 적은 토큰 생성
vision.analyze_image(image, max_tokens=200)
```

### HuggingFace 토큰 오류

1. `.env` 파일에 `HUGGINGFACE_TOKEN` 설정 확인
2. Meta Llama 모델 접근 권한 확인
3. 토큰 유효성 확인: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### YouTube 다운로드 실패

- yt-dlp 업데이트: `pip install --upgrade yt-dlp`
- 연령 제한/지역 제한 영상은 다운로드 불가능할 수 있음

## 라이선스

이 프로젝트는 다음 모델을 사용합니다:
- Llama 3.2 & 3.1: [Meta Llama 3 Community License](https://huggingface.co/meta-llama)

## 기여

버그 리포트 및 기능 제안은 이슈로 등록해주세요.

## 개발 히스토리

- **2024-10-26**: Llama 기반 파이프라인으로 전환
- **2024-10-22**: 프로젝트 초기 설정