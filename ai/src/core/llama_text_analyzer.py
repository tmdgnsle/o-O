"""
Llama 3.1 8B Text Analyzer
텍스트 요약 및 합성을 위한 Llama 3.1 8B 모델 래퍼
"""
import torch
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class LlamaTextAnalyzer:
    """Llama 3.1 8B를 사용한 텍스트 분석 및 요약기"""

    def __init__(
        self,
        model_name: str = "meta-llama/Llama-3.1-8B-Instruct",
        quantization: Optional[str] = "int4"
    ):
        """
        Llama Text Analyzer 초기화

        Args:
            model_name: HuggingFace 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        self.model_name = model_name
        logger.info(f"🚀 Llama Text 모델 로딩 중: {model_name}")
        logger.info(f"📊 양자화: {quantization if quantization else 'FP16'}")
        logger.info(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n")

        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정에 따른 모델 로드
        if quantization == "int4" and torch.cuda.is_available():
            logger.info("⚙️  INT4 양자화 설정 (VRAM ~4GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        elif quantization == "int8" and torch.cuda.is_available():
            logger.info("⚙️  INT8 양자화 설정 (VRAM ~8GB)")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            logger.info("⚙️  FP16 설정 (VRAM ~16GB)")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

        # VRAM 사용량 출력
        if torch.cuda.is_available():
            logger.info(f"✅ 모델 로딩 완료!")
            logger.info(f"📊 VRAM 사용량: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
            logger.info(f"📊 VRAM 예약: {torch.cuda.memory_reserved() / 1024**3:.2f} GB\n")
        else:
            logger.info("✅ 모델 로딩 완료! (CPU 모드)\n")

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7
    ) -> str:
        """
        텍스트 생성

        Args:
            prompt: 사용자 프롬프트
            system_prompt: 시스템 프롬프트 (선택)
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            생성된 텍스트
        """
        # 메시지 구성
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # 채팅 템플릿 적용
        formatted_prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # 토큰화
        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt"
        ).to(self.model.device)

        # 생성
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                do_sample=True if temperature > 0 else False,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )

        # 디코딩 (입력 제거하고 생성된 부분만)
        generated_text = self.tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return generated_text.strip()

    def summarize_video(
        self,
        frame_analyses: List[str],
        transcript: str,
        max_tokens: int = 2048,
        temperature: float = 0.3
    ) -> str:
        """
        영상 프레임 분석 결과와 자막을 종합하여 요약

        Args:
            frame_analyses: 각 프레임의 시각 분석 결과 리스트
            transcript: 영상 자막/음성 텍스트
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도 (낮을수록 일관성 높음)

        Returns:
            종합 요약 결과
        """
        # 프레임 분석 결과 포매팅
        frame_summary = "\n\n".join([
            f"[프레임 {i+1}]\n{analysis}"
            for i, analysis in enumerate(frame_analyses)
        ])

        system_prompt = """당신은 영상 분석 전문가입니다.
영상의 주요 프레임 분석 결과와 음성/자막 내용을 종합하여
영상 전체를 이해하기 쉽게 요약해주세요."""

        user_prompt = f"""다음은 YouTube 영상 분석 결과입니다:

## 시각 정보 (주요 프레임 분석)
{frame_summary}

## 음성/자막 내용
{transcript}

---

위 정보를 바탕으로 다음 형식으로 영상을 종합 요약해주세요:

1. 영상 주제 및 개요
2. 주요 내용 (불릿 포인트)
3. 핵심 메시지
4. 주목할 만한 시각적 요소
"""

        return self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

    def synthesize_analysis(
        self,
        vision_results: List[Dict],
        transcript: str,
        additional_context: Optional[str] = None,
        max_tokens: int = 2048,
        temperature: float = 0.3
    ) -> str:
        """
        비전 분석 결과 (객체 감지, 장면 분류, OCR 등)와 텍스트를 종합

        Args:
            vision_results: 비전 분석 결과 딕셔너리 리스트
                예: [{"frame": 1, "objects": [...], "scene": "...", "text": "..."}]
            transcript: 영상 자막/음성 텍스트
            additional_context: 추가 컨텍스트 정보
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            종합 분석 결과
        """
        # 비전 결과 포매팅
        vision_summary = ""
        for result in vision_results:
            frame_num = result.get("frame", "?")
            vision_summary += f"\n[프레임 {frame_num}]\n"

            if "objects" in result:
                vision_summary += f"- 감지된 객체: {', '.join(result['objects'])}\n"
            if "scene" in result:
                vision_summary += f"- 장면 분류: {result['scene']}\n"
            if "text" in result and result["text"]:
                vision_summary += f"- 텍스트(OCR): {result['text']}\n"
            if "description" in result:
                vision_summary += f"- 설명: {result['description']}\n"

        system_prompt = """당신은 멀티모달 영상 분석 AI입니다.
컴퓨터 비전 분석 결과와 음성/자막을 종합하여
사용자가 이해하기 쉬운 마크다운 형식 리포트를 생성하세요."""

        user_prompt = f"""다음은 영상 분석 결과입니다:

## 컴퓨터 비전 분석
{vision_summary}

## 음성/자막
{transcript}
"""

        if additional_context:
            user_prompt += f"\n## 추가 정보\n{additional_context}\n"

        user_prompt += """
---

위 정보를 종합하여 다음 형식의 마크다운 리포트를 작성하세요:

# 영상 분석 리포트

## 요약

## 시각적 하이라이트

## 주요 내용

## 핵심 인사이트
"""

        return self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

    def extract_key_points(
        self,
        text: str,
        max_points: int = 5,
        max_tokens: int = 512,
        temperature: float = 0.3
    ) -> List[str]:
        """
        텍스트에서 핵심 포인트 추출

        Args:
            text: 입력 텍스트
            max_points: 최대 포인트 개수
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            핵심 포인트 리스트
        """
        prompt = f"""다음 텍스트에서 핵심 포인트 {max_points}개를 추출하세요.
각 포인트는 한 문장으로 간결하게 작성하고, 번호 없이 "-"로 시작하세요.

텍스트:
{text}

핵심 포인트:"""

        result = self.generate(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

        # 결과 파싱
        points = []
        for line in result.split("\n"):
            line = line.strip()
            if line.startswith("-") or line.startswith("•"):
                points.append(line.lstrip("-•").strip())
            elif line and len(points) < max_points:
                points.append(line)

        return points[:max_points]

    def generate_mindmap(
        self,
        video_title: str,
        frame_analyses: List[str],
        transcript: str,
        user_query: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> str:
        """
        영상 내용을 바탕으로 마인드맵 구조를 JSON 형식으로 생성

        Args:
            video_title: 영상 제목
            frame_analyses: 프레임 분석 결과 리스트
            transcript: 영상 자막
            user_query: 사용자 질문/프롬프트 (예: "이 기술로 어떤 프로젝트를 만들 수 있을까?")
            max_tokens: 최대 생성 토큰 수
            temperature: 샘플링 온도

        Returns:
            마인드맵 JSON 문자열
        """
        # 프레임 분석 요약
        frame_summary = "\n\n".join([
            f"[프레임 {i+1}] {analysis}"
            for i, analysis in enumerate(frame_analyses)
        ])

        # 기본 시스템 프롬프트
        system_prompt = """당신은 정보를 구조화하는 전문가입니다.
주어진 영상 내용을 분석하여 마인드맵 구조로 변환합니다.
마인드맵은 깊이 제한 없이 자유롭게 구성할 수 있습니다.

**중요: 반드시 유효한 JSON 형식으로만 응답해야 합니다. 다른 텍스트나 설명을 포함하지 마세요.**"""

        # 사용자 쿼리에 따른 프롬프트 구성
        if user_query:
            analysis_instruction = f"""
사용자의 질문: "{user_query}"

위 질문에 답하는 형태로 마인드맵을 구성하세요.
영상에서 나온 내용을 바탕으로 질문에 대한 답, 아이디어, 관련 개념들을 계층적으로 조직화하세요.
"""
        else:
            analysis_instruction = """
영상의 주요 내용을 계층적으로 조직화하여 마인드맵을 구성하세요.
주요 주제, 하위 개념, 세부 내용 등을 자유롭게 구조화하세요.
"""

        user_prompt = f"""다음은 YouTube 영상 분석 결과입니다:

**영상 제목:** {video_title}

**시각 정보 (주요 프레임):**
{frame_summary}

**음성/자막 내용:**
{transcript}

---

{analysis_instruction}

**필수 규칙:**
1. 마인드맵의 루트 노드는 반드시 영상 제목이어야 합니다
2. 각 노드는 반드시 "keyword"와 "description" 필드를 가져야 합니다
   - **keyword**: 짧고 명확한 핵심 단어 (3-5 단어)
   - **description**: 영상에서 나온 구체적인 사실, 수치, 인용문 등 실제 내용 (추상적인 설명 금지!)
3. "children" 배열로 하위 노드들을 표현합니다 (자식이 없으면 null)
4. 깊이 제한 없이 필요한 만큼 계층을 만들 수 있습니다
5. **반드시 유효한 JSON만 출력하세요. 백틱(```), 설명, 주석을 포함하지 마세요**

**중요: keyword를 JSON의 key로 사용하지 마세요! 반드시 "keyword" 필드를 사용하세요!**

**Description 작성 규칙:**
- ❌ 나쁜 예: "트럼프의 관세 인상에 대해 설명", "무역 관계에 대해 설명"
- ✅ 좋은 예: "트럼프가 캐나다에 추가 10% 관세 부과, 레이건 광고를 오도적이라고 비판", "미-캐 무역 규모 $762B, 캐나다는 미국의 2위 무역 파트너"
- 반드시 영상에서 언급된 **구체적인 사실, 숫자, 날짜, 인물, 인용문**을 포함하세요!

올바른 형식:
{{
  "keyword": "영상 제목",
  "description": "영상에 대한 간략한 설명",
  "children": [
    {{
      "keyword": "주요 주제 1",
      "description": "주제에 대한 상세 설명",
      "children": [
        {{
          "keyword": "하위 개념 1-1",
          "description": "하위 개념에 대한 설명",
          "children": null
        }}
      ]
    }},
    {{
      "keyword": "주요 주제 2",
      "description": "주제에 대한 상세 설명",
      "children": null
    }}
  ]
}}

틀린 형식 (절대 사용하지 마세요):
{{
  "영상 제목": {{
    "description": "...",
    "children": [...]
  }}
}}

이제 위의 올바른 형식에 맞춰 유효한 JSON만 출력하세요:"""

        result = self.generate(
            user_prompt,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

        return result.strip()

    def get_vram_usage(self) -> Dict[str, float]:
        """현재 VRAM 사용량 반환"""
        if torch.cuda.is_available():
            return {
                "allocated_gb": torch.cuda.memory_allocated() / 1024**3,
                "reserved_gb": torch.cuda.memory_reserved() / 1024**3
            }
        return {"allocated_gb": 0.0, "reserved_gb": 0.0}

    def cleanup(self):
        """메모리 정리"""
        if hasattr(self, 'model'):
            del self.model
        if hasattr(self, 'tokenizer'):
            del self.tokenizer

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        logger.info("🧹 메모리 정리 완료")


def main():
    """테스트 예제"""
    logger.info("=" * 60)
    logger.info("🦙 Llama 3.1 8B Text Analyzer 테스트")
    logger.info("=" * 60)

    # Analyzer 초기화
    analyzer = LlamaTextAnalyzer(quantization="int4")

    # 간단한 생성 테스트
    logger.info("\n📝 텍스트 생성 테스트...")
    result = analyzer.generate(
        "인공지능의 미래에 대해 3문장으로 설명해주세요.",
        temperature=0.7
    )
    logger.info(f"\n🤖 생성 결과:\n{result}\n")

    # VRAM 사용량 확인
    vram = analyzer.get_vram_usage()
    logger.info(f"📊 VRAM 사용량: {vram['allocated_gb']:.2f} GB")

    # 핵심 포인트 추출 테스트
    logger.info("\n📌 핵심 포인트 추출 테스트...")
    sample_text = """
    인공지능은 현대 사회에서 점점 더 중요한 역할을 하고 있습니다.
    의료, 교육, 금융, 제조업 등 다양한 분야에서 AI가 활용되고 있으며,
    특히 대규모 언어 모델의 발전으로 자연어 처리 능력이 크게 향상되었습니다.
    하지만 AI 윤리와 개인정보 보호 문제도 함께 고려해야 합니다.
    """
    points = analyzer.extract_key_points(sample_text, max_points=3)
    logger.info("핵심 포인트:")
    for i, point in enumerate(points, 1):
        logger.info(f"{i}. {point}")

    # 메모리 정리
    analyzer.cleanup()


if __name__ == "__main__":
    main()
