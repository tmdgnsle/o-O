# 하이브리드 YouTube 분석 시스템 - VRAM & 메모리 요구사항

## 📊 전체 시스템 요구사항 요약

### RTX A5000 24GB VRAM 기준

| 설정 | 총 VRAM | 총 RAM | 속도 | 추천도 |
|------|---------|--------|------|--------|
| **INT4 (추천)** | **~7GB** | **~8GB** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| INT8 | ~10GB | ~10GB | ⚡⚡ | ⭐⭐⭐⭐ |
| FP16 | ~19GB | ~14GB | ⚡ | ⭐⭐⭐ |

**✅ RTX A5000 24GB에서 모든 설정이 안전하게 작동합니다!**

---

## 🔧 모델별 상세 분석

### 1. YOLO v11 nano (객체 감지)

**모델 크기:**
- 파일: ~6MB (yolo11n.pt)
- 파라미터: ~2.6M

**메모리 사용량:**
- **VRAM**: ~0.8-1.0GB (추론 시)
- **RAM**: ~500MB (모델 로딩)
- **디스크**: ~6MB

**추론 속도:**
- RTX A5000: ~2-3ms/이미지
- CPU: ~50-80ms/이미지

**사용 목적:**
- 사람, 물체, 동물 등 80개 클래스 감지
- 바운딩 박스 + 신뢰도 점수 제공

---

### 2. CLIP ViT-B/32 (장면 분류)

**모델 크기:**
- 파일: ~338MB
- 파라미터: ~151M (이미지 인코더 ~88M, 텍스트 인코더 ~63M)

**메모리 사용량:**
- **VRAM**: ~1.0-1.2GB (FP32), ~600MB (FP16)
- **RAM**: ~500MB
- **디스크**: ~338MB

**추론 속도:**
- RTX A5000: ~10-15ms/이미지
- CPU: ~200-300ms/이미지

**사용 목적:**
- Zero-shot 이미지 분류
- "뉴스 스튜디오", "회의실" 등 자유로운 텍스트로 분류
- 이미지-텍스트 유사도 계산

---

### 3. PaddleOCR (한글 OCR)

**모델 크기:**
- Detection model: ~3.5MB (ch_PP-OCRv4_det)
- Recognition model: ~12MB (korean_PP-OCRv4_rec)
- Angle classifier: ~1.4MB (ch_ppocr_mobile_v2.0_cls)

**메모리 사용량:**
- **VRAM**: ~400-600MB
- **RAM**: ~1GB
- **디스크**: ~17MB

**추론 속도:**
- RTX A5000: ~50-100ms/이미지 (텍스트 밀도에 따라)
- CPU: ~200-400ms/이미지

**사용 목적:**
- 한글 + 영어 텍스트 인식
- 화면 내 자막, 그래픽 텍스트 추출
- 바운딩 박스 + 텍스트 + 신뢰도

**지원 언어:**
- 한글, 영어, 중국어, 일본어 등 80+ 언어

---

### 4. Llama 3.1 8B Instruct (텍스트 LLM)

**모델 크기:**
- 원본 (FP16): ~16GB
- INT8 양자화: ~8GB
- INT4 양자화: ~4GB

**메모리 사용량 (양자화별):**

#### INT4 (추천) ⭐
- **VRAM**: ~4.5-5GB (모델) + ~0.5GB (KV cache) = **~5GB**
- **RAM**: ~6GB
- **디스크**: ~4.3GB
- **추론 속도**: ~15-25 tokens/s
- **품질**: 원본의 ~95% 유지

#### INT8
- **VRAM**: ~8GB (모델) + ~0.5GB (KV cache) = **~8.5GB**
- **RAM**: ~9GB
- **디스크**: ~8.5GB
- **추론 속도**: ~20-30 tokens/s
- **품질**: 원본의 ~98% 유지

#### FP16
- **VRAM**: ~16GB (모델) + ~1GB (KV cache) = **~17GB**
- **RAM**: ~12GB
- **디스크**: ~16GB
- **추론 속도**: ~25-35 tokens/s
- **품질**: 100% (원본)

**사용 목적:**
- CV 분석 결과 종합 및 요약
- 자막 + 시각 정보 통합 분석
- 자연어로 영상 내용 설명

---

## 💾 총 메모리 계산

### 시나리오 A: INT4 (기본 추천) ⭐⭐⭐⭐⭐

```
📊 VRAM 사용량:
├─ YOLO v11n        : 1.0 GB
├─ CLIP ViT-B/32    : 1.0 GB
├─ PaddleOCR        : 0.5 GB
├─ Llama 3.1 8B INT4: 5.0 GB
├─ CUDA overhead    : 0.5 GB
└─ Total VRAM       : 8.0 GB ✅

📊 RAM 사용량:
├─ Python runtime   : 1.0 GB
├─ 모델 로딩 버퍼    : 2.0 GB
├─ 영상 다운로드     : 0.5 GB
├─ 프레임 데이터     : 0.5 GB
├─ 자막 데이터       : 0.1 GB
├─ 중간 결과 버퍼    : 1.0 GB
├─ OS 오버헤드       : 1.0 GB
└─ Total RAM        : 6.1 GB

📊 디스크 사용량:
├─ YOLO v11n        : 0.006 GB
├─ CLIP ViT-B/32    : 0.338 GB
├─ PaddleOCR        : 0.017 GB
├─ Llama 3.1 8B INT4: 4.300 GB
├─ 임시 영상 파일    : 0.5~2 GB (자동 삭제)
└─ Total Disk       : ~4.7 GB (영구) + 0.5-2GB (임시)
```

**✅ RTX A5000 24GB 사용률: 33%**
**✅ 여유 VRAM: ~16GB (다른 작업 동시 가능)**

---

### 시나리오 B: INT8 (고품질)

```
📊 VRAM 사용량:
├─ YOLO v11n        : 1.0 GB
├─ CLIP ViT-B/32    : 1.0 GB
├─ PaddleOCR        : 0.5 GB
├─ Llama 3.1 8B INT8: 8.5 GB
├─ CUDA overhead    : 0.5 GB
└─ Total VRAM       : 11.5 GB ✅

📊 RAM 사용량:
├─ Python runtime   : 1.0 GB
├─ 모델 로딩 버퍼    : 3.0 GB
├─ 영상 다운로드     : 0.5 GB
├─ 프레임 데이터     : 0.5 GB
├─ 자막 데이터       : 0.1 GB
├─ 중간 결과 버퍼    : 1.0 GB
├─ OS 오버헤드       : 1.0 GB
└─ Total RAM        : 7.1 GB
```

**✅ RTX A5000 24GB 사용률: 48%**
**✅ 여유 VRAM: ~12.5GB**

---

### 시나리오 C: FP16 (최고 품질)

```
📊 VRAM 사용량:
├─ YOLO v11n        : 1.0 GB
├─ CLIP ViT-B/32    : 1.0 GB
├─ PaddleOCR        : 0.5 GB
├─ Llama 3.1 8B FP16: 17.0 GB
├─ CUDA overhead    : 0.5 GB
└─ Total VRAM       : 20.0 GB ✅

📊 RAM 사용량:
├─ Python runtime   : 1.0 GB
├─ 모델 로딩 버퍼    : 5.0 GB
├─ 영상 다운로드     : 0.5 GB
├─ 프레임 데이터     : 0.5 GB
├─ 자막 데이터       : 0.1 GB
├─ 중간 결과 버퍼    : 1.0 GB
├─ OS 오버헤드       : 1.0 GB
└─ Total RAM        : 9.1 GB
```

**✅ RTX A5000 24GB 사용률: 83%**
**⚠️  여유 VRAM: ~4GB (빡빡)**

---

## ⚡ 성능 벤치마크 (예상)

### RTX A5000 24GB 기준 (5개 프레임 분석)

| 설정 | CV 분석 | LLM 요약 | 총 시간 |
|------|--------|---------|---------|
| INT4 | ~5초 | ~15초 | **~20초** ⚡⚡⚡ |
| INT8 | ~5초 | ~12초 | **~17초** ⚡⚡⚡ |
| FP16 | ~5초 | ~10초 | **~15초** ⚡⚡⚡ |

**상세 시간 분해:**
```
영상 다운로드:     ~5-10초 (네트워크 속도 의존)
프레임 추출:       ~2-3초
자막 추출:         ~1-2초
CV 분석 (5프레임): ~5초 (1초/프레임)
LLM 종합 요약:     ~10-15초
총 시간:           ~23-35초
```

---

## 🔄 다른 GPU와 비교

| GPU | VRAM | INT4 | INT8 | FP16 |
|-----|------|------|------|------|
| **RTX A5000** | 24GB | ✅✅✅ | ✅✅✅ | ✅✅ |
| RTX 4090 | 24GB | ✅✅✅ | ✅✅✅ | ✅✅ |
| RTX 4080 | 16GB | ✅✅✅ | ✅✅ | ❌ |
| RTX 4070 Ti | 12GB | ✅✅ | ⚠️ | ❌ |
| RTX 3090 | 24GB | ✅✅✅ | ✅✅✅ | ✅✅ |
| RTX 3080 | 10GB | ✅ | ❌ | ❌ |

**범례:**
- ✅✅✅ : 여유롭게 작동, 다중 작업 가능
- ✅✅ : 안정적으로 작동
- ✅ : 작동하지만 빡빡
- ⚠️ : 작동 가능하나 불안정
- ❌ : VRAM 부족

---

## 💡 메모리 최적화 팁

### 1. 모델 순차 로딩 (VRAM 절약)

```python
# 나쁜 예: 모든 모델 동시 로딩
analyzer = HybridVisionAnalyzer(
    use_yolo=True,
    use_clip=True,
    use_ocr=True,
    use_llm=True
)  # VRAM ~8GB 동시 사용

# 좋은 예: 필요할 때만 로딩
# 1단계: CV 분석만
cv_analyzer = HybridVisionAnalyzer(
    use_yolo=True,
    use_clip=True,
    use_ocr=True,
    use_llm=False  # LLM은 아직 로딩 안함
)
cv_results = analyze_frames(cv_analyzer)

# CV 모델 언로딩
del cv_analyzer
torch.cuda.empty_cache()  # VRAM 해제

# 2단계: LLM만 로딩
llm_analyzer = HybridVisionAnalyzer(
    use_yolo=False,
    use_clip=False,
    use_ocr=False,
    use_llm=True
)
summary = llm_analyzer.summarize(cv_results)
```

이렇게 하면 **VRAM 피크: ~5GB** (동시 로딩 대비 40% 절감)

### 2. 배치 처리 (속도 향상)

```python
# CV 분석을 배치로 처리
# 현재: 1개씩 → 5초
# 배치: 5개 동시 → 2초 (2.5배 빠름)
```

### 3. 캐싱 활용

```python
# YOLO 모델을 한 번만 로딩하고 재사용
# 같은 영상의 여러 프레임 분석 시 효율적
```

---

## 🎯 최종 권장 설정

### RTX A5000 24GB 사용자

**추천: INT4 양자화**

```bash
python test_youtube_analyzer_hybrid.py \
    "https://www.youtube.com/watch?v=VIDEO_ID" \
    --frames 5 \
    --quantization int4
```

**이유:**
- ✅ VRAM 사용률 33% (여유롭게 작동)
- ✅ 다른 작업 동시 수행 가능 (브라우저, 코딩 등)
- ✅ 품질 저하 거의 없음 (~95%)
- ✅ 빠른 속도 (20초/영상)
- ✅ 디스크 공간 절약 (~4.7GB)

**INT8 또는 FP16은 언제 쓰나요?**
- INT8: 품질이 매우 중요한 경우 (98% 품질)
- FP16: 벤치마크/연구용 (100% 품질, VRAM 여유 필요)

---

## 📝 체크리스트

실행 전 확인사항:

- [ ] GPU 드라이버 최신 버전 설치
- [ ] CUDA 12.1+ 설치
- [ ] Python 3.12 가상환경 활성화
- [ ] 의존성 설치: `bash install_hybrid_dependencies.sh`
- [ ] `.env` 파일에 `HUGGINGFACE_TOKEN` 설정
- [ ] 사용 가능한 VRAM: `nvidia-smi` 로 확인
- [ ] 사용 가능한 RAM: 최소 8GB 권장
- [ ] 디스크 여유 공간: 최소 10GB (모델 + 임시 파일)

---

## 🚀 실행 예시

```bash
# 1. 의존성 설치
bash install_hybrid_dependencies.sh

# 2. INT4로 실행 (추천)
python test_youtube_analyzer_hybrid.py \
    "https://www.youtube.com/watch?v=rT8M0akvj3s" \
    --frames 5 \
    --quantization int4

# 3. VRAM 모니터링 (다른 터미널)
watch -n 1 nvidia-smi
```

---

## ❓ FAQ

**Q: OOM (Out of Memory) 에러가 발생하면?**
A:
1. INT4 양자화 사용
2. 프레임 수 줄이기 (--frames 3)
3. 다른 프로그램 종료 (브라우저, IDE 등)
4. `torch.cuda.empty_cache()` 호출

**Q: 속도가 너무 느려요**
A:
1. CUDA가 제대로 설치되었는지 확인
2. CPU로 실행되고 있는지 확인 (`nvidia-smi`)
3. INT4 양자화 사용
4. 프레임 수 줄이기

**Q: 품질이 만족스럽지 않아요**
A:
1. INT8 또는 FP16으로 변경
2. 프레임 수 늘리기 (--frames 10)
3. CV 모델 업그레이드 (YOLO v11m 등)

---

**작성일**: 2025년 10월 22일
**시스템**: RTX A5000 24GB VRAM
**PyTorch 버전**: 2.5.1
**CUDA 버전**: 12.1