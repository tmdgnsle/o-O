"""
import logging
logger = logging.getLogger(__name__)
YouTube 영상 분석 - 하이브리드 방식 (CV + LLM)
RTX A5000 24GB VRAM 최적화

파이프라인:
1. 영상 다운로드 & 프레임 추출
2. 자막 추출
3. CV 기반 구조화 분석 (YOLO + CLIP + OCR)
4. Llama 3.1 텍스트 LLM으로 종합 요약
"""
import logging

logger = logging.getLogger(__name__)

import os
from dotenv import load_dotenv
from video_analyzer.frame_extractor import FrameExtractor
from video_analyzer.transcript_extractor import TranscriptExtractor
import tempfile
import shutil
import torch
from PIL import Image
import numpy as np

# 환경변수 로드
load_dotenv()


class HybridVisionAnalyzer:
    """
    하이브리드 비전 분석기
    - CV 모델: YOLO + CLIP + PaddleOCR
    - LLM: Llama 3.1 8B (텍스트 전용)
    """

    def __init__(
        self,
        use_yolo: bool = True,
        use_clip: bool = True,
        use_ocr: bool = True,
        use_llm: bool = True,
        llm_quantization: str = "int4"
    ):
        """
        Args:
            use_yolo: YOLO 객체 감지 사용 여부
            use_clip: CLIP 장면 분류 사용 여부
            use_ocr: OCR 사용 여부
            use_llm: Llama 텍스트 LLM 사용 여부
            llm_quantization: LLM 양자화 ("int4", "int8", "fp16")
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🖥️  디바이스: {self.device}")

        self.yolo_model = None
        self.clip_model = None
        self.ocr_model = None
        self.llm_model = None

        # 각 모델 초기화
        if use_yolo:
            self._load_yolo()

        if use_clip:
            self._load_clip()

        if use_ocr:
            self._load_ocr()

        if use_llm:
            self._load_llm(llm_quantization)

    def _load_yolo(self):
        """YOLO v11 nano 로드 (객체 감지)"""
        logger.info("\n🔍 YOLO v11 nano 로딩 중...")
        try:
            from ultralytics import YOLO
            # nano 버전 사용 (가장 가벼움)
            self.yolo_model = YOLO('yolo11n.pt')
            logger.info("✅ YOLO v11 nano 로드 완료 (VRAM ~1GB)")
        except Exception as e:
            logger.info(f"⚠️  YOLO 로드 실패: {e}")
            logger.info("   설치: pip install ultralytics")

    def _load_clip(self):
        """CLIP 로드 (장면 분류)"""
        logger.info("\n🎨 CLIP 로딩 중...")
        try:
            import clip
            self.clip_model, self.clip_preprocess = clip.load(
                "ViT-B/32",
                device=self.device
            )
            logger.info("✅ CLIP ViT-B/32 로드 완료 (VRAM ~1GB)")
        except Exception as e:
            logger.info(f"⚠️  CLIP 로드 실패: {e}")
            logger.info("   설치: pip install git+https://github.com/openai/CLIP.git")

    def _load_ocr(self):
        """PaddleOCR 로드 (한글 OCR)"""
        logger.info("\n📝 PaddleOCR 로딩 중...")
        try:
            from paddleocr import PaddleOCR
            # 한글 + 영어 지원
            self.ocr_model = PaddleOCR(
                lang='korean',
                use_angle_cls=True,
                show_log=False
            )
            logger.info("✅ PaddleOCR 로드 완료 (VRAM ~500MB)")
        except Exception as e:
            logger.info(f"⚠️  OCR 로드 실패: {e}")
            logger.info("   설치: pip install paddleocr paddlepaddle-gpu")

    def _load_llm(self, quantization: str = "int4"):
        """Llama 3.1 8B 텍스트 LLM 로드"""
        logger.info(f"\n🦙 Llama 3.1 8B 로딩 중 (양자화: {quantization})...")
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

            model_name = "meta-llama/Llama-3.1-8B-Instruct"

            self.llm_tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

            # 양자화 설정
            if quantization == "int4":
                logger.info("⚙️  INT4 양자화 (VRAM ~4-5GB)")
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.bfloat16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )
                self.llm_model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    quantization_config=quantization_config,
                    device_map="auto",
                    token=os.getenv("HUGGINGFACE_TOKEN")
                )
            elif quantization == "int8":
                logger.info("⚙️  INT8 양자화 (VRAM ~8-9GB)")
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)
                self.llm_model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    quantization_config=quantization_config,
                    device_map="auto",
                    token=os.getenv("HUGGINGFACE_TOKEN")
                )
            else:
                logger.info("⚙️  FP16 (VRAM ~16GB)")
                self.llm_model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    token=os.getenv("HUGGINGFACE_TOKEN")
                )

            logger.info("✅ Llama 3.1 8B 로드 완료")
        except Exception as e:
            logger.info(f"⚠️  Llama 로드 실패: {e}")

    def detect_objects(self, image_path: str):
        """YOLO로 객체 감지"""
        if not self.yolo_model:
            return []

        try:
            results = self.yolo_model(image_path, verbose=False)

            objects = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    name = self.yolo_model.names[cls]
                    objects.append({
                        'name': name,
                        'confidence': conf,
                        'bbox': box.xyxy[0].tolist()
                    })

            return objects
        except Exception as e:
            logger.info(f"⚠️  YOLO 분석 실패: {e}")
            return []

    def classify_scene(self, image_path: str, candidate_scenes: list):
        """CLIP으로 장면 분류 (Zero-shot)"""
        if not self.clip_model:
            return None

        try:
            import clip

            image = self.clip_preprocess(Image.open(image_path)).unsqueeze(0).to(self.device)
            text = clip.tokenize(candidate_scenes).to(self.device)

            with torch.no_grad():
                image_features = self.clip_model.encode_image(image)
                text_features = self.clip_model.encode_text(text)

                similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
                values, indices = similarity[0].topk(3)

            # 상위 3개 반환
            results = []
            for i in range(3):
                results.append({
                    'scene': candidate_scenes[indices[i]],
                    'confidence': float(values[i])
                })

            return results
        except Exception as e:
            logger.info(f"⚠️  CLIP 분석 실패: {e}")
            return None

    def extract_text_ocr(self, image_path: str):
        """OCR로 텍스트 추출"""
        if not self.ocr_model:
            return []

        try:
            result = self.ocr_model.ocr(image_path, cls=True)

            texts = []
            if result and result[0]:
                for line in result[0]:
                    text = line[1][0]
                    confidence = line[1][1]
                    texts.append({
                        'text': text,
                        'confidence': confidence
                    })

            return texts
        except Exception as e:
            logger.info(f"⚠️  OCR 분석 실패: {e}")
            return []

    def analyze_frame_cv(self, image_path: str, frame_time: float):
        """CV 모델로 프레임 구조화 분석"""
        logger.info(f"   🔍 CV 분석 중...")

        result = {
            'time': frame_time,
            'objects': [],
            'scene': None,
            'text': []
        }

        # 1. 객체 감지
        if self.yolo_model:
            result['objects'] = self.detect_objects(image_path)

        # 2. 장면 분류
        if self.clip_model:
            scenes = [
                "a news broadcast studio",
                "a government meeting or conference",
                "an interview or discussion",
                "a presentation or lecture",
                "an outdoor scene",
                "a casual conversation",
                "a formal ceremony"
            ]
            result['scene'] = self.classify_scene(image_path, scenes)

        # 3. OCR
        if self.ocr_model:
            result['text'] = self.extract_text_ocr(image_path)

        return result

    def summarize_with_llm(self, cv_results: list, transcript: dict, video_info: dict):
        """Llama 3.1로 CV 분석 결과 종합 요약"""
        if not self.llm_model:
            return "LLM 모델이 로드되지 않았습니다."

        logger.info("\n🦙 Llama 3.1로 종합 분석 중...")

        # 프롬프트 구성
        prompt = f"""다음은 YouTube 영상 "{video_info['title']}"의 AI 분석 결과입니다.

📊 영상 정보:
- 제목: {video_info['title']}
- 채널: {video_info['channel']}
- 길이: {video_info['duration']}초

"""

        # 자막 추가
        if transcript and transcript.get('success'):
            prompt += f"""📝 자막 전체 내용:
{transcript['full_text'][:500]}...

"""

        # 프레임별 CV 분석 결과 추가
        prompt += "🖼️ 프레임별 시각적 분석:\n\n"

        for i, frame_result in enumerate(cv_results, 1):
            time = frame_result['time']
            timestamp = f"{int(time // 60):02d}:{int(time % 60):02d}"

            prompt += f"[{timestamp}]\n"

            # 장면 분류
            if frame_result['scene']:
                top_scene = frame_result['scene'][0]
                prompt += f"- 장면 유형: {top_scene['scene']} ({top_scene['confidence']:.1%})\n"

            # 객체
            if frame_result['objects']:
                obj_names = [obj['name'] for obj in frame_result['objects'][:5]]
                prompt += f"- 감지된 객체: {', '.join(obj_names)}\n"

            # OCR 텍스트
            if frame_result['text']:
                ocr_texts = [t['text'] for t in frame_result['text'][:3]]
                prompt += f"- 화면 내 텍스트: {' / '.join(ocr_texts)}\n"

            prompt += "\n"

        # 질문
        prompt += """위 정보를 바탕으로 다음 질문에 답해주세요:

1. 이 영상의 주제와 핵심 내용은 무엇인가요?
2. 주요 등장 인물이나 객체는 무엇인가요?
3. 영상의 전반적인 분위기와 맥락은 어떤가요?
4. 핵심 키워드 5개를 추출해주세요.

간결하고 구조화된 형태로 답변해주세요."""

        # LLM 추론
        try:
            messages = [
                {"role": "system", "content": "당신은 영상 분석 전문가입니다. 주어진 데이터를 바탕으로 정확하고 통찰력 있는 분석을 제공합니다."},
                {"role": "user", "content": prompt}
            ]

            inputs = self.llm_tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(self.llm_model.device)

            outputs = self.llm_model.generate(
                inputs,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.9,
                do_sample=True
            )

            response = self.llm_tokenizer.decode(
                outputs[0][inputs.shape[1]:],
                skip_special_tokens=True
            )

            return response
        except Exception as e:
            logger.info(f"⚠️  LLM 추론 실패: {e}")
            return f"LLM 추론 중 오류 발생: {e}"


def test_hybrid_analysis(
    youtube_url: str,
    max_frames: int = 5,
    llm_quantization: str = "int4"
):
    """
    하이브리드 YouTube 영상 분석

    Args:
        youtube_url: YouTube URL
        max_frames: 분석할 최대 프레임 수
        llm_quantization: LLM 양자화 ("int4", "int8", "fp16")
    """
    logger.info("=" * 80)
    logger.info("🎬 하이브리드 YouTube 영상 분석 시작")
    logger.info("=" * 80)
    logger.info(f"📺 URL: {youtube_url}")
    logger.info(f"🖼️  최대 프레임: {max_frames}개")
    logger.info(f"🦙 LLM 양자화: {llm_quantization}")
    logger.info()

    # Step 1: 프레임 추출
    logger.info("\n" + "=" * 80)
    logger.info("📥 STEP 1: 영상 다운로드 & 프레임 추출")
    logger.info("=" * 80)

    temp_dir = tempfile.mkdtemp(prefix="youtube_hybrid_")
    logger.info(f"📁 임시 디렉토리: {temp_dir}")

    extractor = FrameExtractor(output_dir=temp_dir)

    logger.info("⏬ 영상 다운로드 중...")
    video_info = extractor.download_video(youtube_url)

    if not video_info['success']:
        logger.info(f"❌ 다운로드 실패: {video_info['error']}")
        return

    logger.info(f"✅ 다운로드 완료!")
    logger.info(f"   제목: {video_info['title']}")
    logger.info(f"   채널: {video_info['channel']}")
    logger.info(f"   길이: {video_info['duration']}초")

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
        logger.info(f"   세그먼트: {len(transcript_result['segments'])}개")
        logger.info(f"\n📄 자막 미리보기 (처음 300자):")
        logger.info("-" * 80)
        logger.info(transcript_result['full_text'][:300] + "...")
        logger.info("-" * 80)
    else:
        logger.info(f"⚠️  자막 추출 실패: {transcript_result.get('error', 'Unknown')}")

    # Step 3: 하이브리드 분석기 초기화
    logger.info("\n" + "=" * 80)
    logger.info("🤖 STEP 3: 하이브리드 분석기 초기화")
    logger.info("=" * 80)

    analyzer = HybridVisionAnalyzer(
        use_yolo=True,
        use_clip=True,
        use_ocr=True,
        use_llm=True,
        llm_quantization=llm_quantization
    )

    # Step 4: CV 기반 프레임 분석
    logger.info("\n" + "=" * 80)
    logger.info("🔍 STEP 4: CV 기반 프레임 분석")
    logger.info("=" * 80)

    cv_results = []
    for i, frame in enumerate(frames, 1):
        timestamp_str = f"{int(frame['timestamp'] // 60):02d}:{int(frame['timestamp'] % 60):02d}"
        logger.info(f"\n🖼️  프레임 {i}/{len(frames)} ({timestamp_str})")

        result = analyzer.analyze_frame_cv(frame['path'], frame['timestamp'])
        cv_results.append(result)

        # 결과 미리보기
        if result['scene']:
            logger.info(f"   장면: {result['scene'][0]['scene']} ({result['scene'][0]['confidence']:.1%})")
        if result['objects']:
            obj_names = [obj['name'] for obj in result['objects'][:5]]
            logger.info(f"   객체: {', '.join(obj_names)}")
        if result['text']:
            ocr_texts = [t['text'] for t in result['text'][:2]]
            logger.info(f"   텍스트: {' / '.join(ocr_texts)}")

    # Step 5: LLM 종합 분석
    logger.info("\n" + "=" * 80)
    logger.info("🧠 STEP 5: LLM 종합 분석 및 요약")
    logger.info("=" * 80)

    summary = analyzer.summarize_with_llm(cv_results, transcript_result, video_info)

    # 최종 결과 출력
    logger.info("\n" + "=" * 80)
    logger.info("📊 최종 분석 결과")
    logger.info("=" * 80)
    logger.info()
    logger.info(summary)
    logger.info()

    # 임시 파일 정리
    logger.info("\n🗑️  임시 파일 삭제 중...")
    try:
        shutil.rmtree(temp_dir)
        logger.info(f"✅ 임시 디렉토리 삭제 완료: {temp_dir}")
    except Exception as e:
        logger.info(f"⚠️  임시 파일 삭제 실패: {e}")

    logger.info("\n" + "=" * 80)
    logger.info("✅ 하이브리드 분석 완료!")
    logger.info("=" * 80)


if __name__ == "__main__":
    import sys

    logger.info("""
╔══════════════════════════════════════════════════════════════════════════════╗
║              YouTube 하이브리드 영상 분석 (CV + LLM)                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

파이프라인:
1. 영상 다운로드 & 프레임 추출
2. 자막 추출
3. CV 분석 (YOLO + CLIP + OCR)
4. Llama 3.1 텍스트 LLM 종합 요약

사용법:
    python test_youtube_analyzer_hybrid.py <YouTube_URL> [옵션]

옵션:
    --frames N       : 분석할 최대 프레임 수 (기본값: 5)
    --quantization Q : LLM 양자화 (int4/int8/fp16, 기본값: int4)

예시:
    python test_youtube_analyzer_hybrid.py "https://www.youtube.com/watch?v=VIDEO_ID"
    python test_youtube_analyzer_hybrid.py "https://www.youtube.com/watch?v=VIDEO_ID" --frames 3 --quantization int8

필수 설치:
    pip install ultralytics paddleocr paddlepaddle-gpu
    pip install git+https://github.com/openai/CLIP.git

필수 환경변수 (.env):
    HUGGINGFACE_TOKEN=your_token_here
    """)

    if len(sys.argv) < 2:
        logger.info("\n❌ YouTube URL을 입력해주세요!")
        logger.info("예시: python test_youtube_analyzer_hybrid.py 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'\n")
        sys.exit(1)

    # 인자 파싱
    youtube_url = sys.argv[1]

    max_frames = 5
    if "--frames" in sys.argv:
        idx = sys.argv.index("--frames")
        if idx + 1 < len(sys.argv):
            max_frames = int(sys.argv[idx + 1])

    llm_quantization = "int4"
    if "--quantization" in sys.argv:
        idx = sys.argv.index("--quantization")
        if idx + 1 < len(sys.argv):
            llm_quantization = sys.argv[idx + 1]

    # 실행
    test_hybrid_analysis(
        youtube_url=youtube_url,
        max_frames=max_frames,
        llm_quantization=llm_quantization
    )