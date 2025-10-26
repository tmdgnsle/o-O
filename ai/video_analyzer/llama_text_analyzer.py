"""
Llama 3.1 8B Text Analyzer
텍스트 요약 및 합성을 위한 Llama 3.1 8B 모델 래퍼
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()


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
        print(f"🚀 Llama Text 모델 로딩 중: {model_name}")
        print(f"📊 양자화: {quantization if quantization else 'FP16'}")
        print(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n")

        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정에 따른 모델 로드
        if quantization == "int4" and torch.cuda.is_available():
            print("⚙️  INT4 양자화 설정 (VRAM ~4GB)")
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
            print("⚙️  INT8 양자화 설정 (VRAM ~8GB)")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            print("⚙️  FP16 설정 (VRAM ~16GB)")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

        # VRAM 사용량 출력
        if torch.cuda.is_available():
            print(f"✅ 모델 로딩 완료!")
            print(f"📊 VRAM 사용량: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
            print(f"📊 VRAM 예약: {torch.cuda.memory_reserved() / 1024**3:.2f} GB\n")
        else:
            print("✅ 모델 로딩 완료! (CPU 모드)\n")

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

        print("🧹 메모리 정리 완료")


def main():
    """테스트 예제"""
    print("=" * 60)
    print("🦙 Llama 3.1 8B Text Analyzer 테스트")
    print("=" * 60)

    # Analyzer 초기화
    analyzer = LlamaTextAnalyzer(quantization="int4")

    # 간단한 생성 테스트
    print("\n📝 텍스트 생성 테스트...")
    result = analyzer.generate(
        "인공지능의 미래에 대해 3문장으로 설명해주세요.",
        temperature=0.7
    )
    print(f"\n🤖 생성 결과:\n{result}\n")

    # VRAM 사용량 확인
    vram = analyzer.get_vram_usage()
    print(f"📊 VRAM 사용량: {vram['allocated_gb']:.2f} GB")

    # 핵심 포인트 추출 테스트
    print("\n📌 핵심 포인트 추출 테스트...")
    sample_text = """
    인공지능은 현대 사회에서 점점 더 중요한 역할을 하고 있습니다.
    의료, 교육, 금융, 제조업 등 다양한 분야에서 AI가 활용되고 있으며,
    특히 대규모 언어 모델의 발전으로 자연어 처리 능력이 크게 향상되었습니다.
    하지만 AI 윤리와 개인정보 보호 문제도 함께 고려해야 합니다.
    """
    points = analyzer.extract_key_points(sample_text, max_points=3)
    print("핵심 포인트:")
    for i, point in enumerate(points, 1):
        print(f"{i}. {point}")

    # 메모리 정리
    analyzer.cleanup()


if __name__ == "__main__":
    main()
