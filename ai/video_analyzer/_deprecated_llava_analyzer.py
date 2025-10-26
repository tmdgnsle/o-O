"""
LLaVA 로컬 비전 분석 모듈
- 완전 무료, 오프라인 가능
- VRAM: 13GB
"""
import torch
from transformers import AutoProcessor, LlavaForConditionalGeneration
from typing import List, Dict, Optional
from PIL import Image
import os


class LLaVAAnalyzer:
    """LLaVA 로컬 이미지 분석기"""

    def __init__(
        self,
        model_name: str = "llava-hf/llava-1.5-13b-hf",
        quantization: str = "int4"
    ):
        """
        Args:
            model_name: LLaVA 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        print(f"🚀 LLaVA 모델 로딩 중: {model_name}")
        print(f"📊 양자화: {quantization if quantization else 'FP16'}")

        self.processor = AutoProcessor.from_pretrained(model_name)

        # 양자화 설정
        if quantization == "int4" and torch.cuda.is_available():
            from transformers import BitsAndBytesConfig

            print("⚙️  INT4 양자화 설정 (VRAM ~7GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            self.model = LlavaForConditionalGeneration.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                torch_dtype=torch.float16
            )
        elif quantization == "int8" and torch.cuda.is_available():
            from transformers import BitsAndBytesConfig

            print("⚙️  INT8 양자화 설정 (VRAM ~13GB)")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = LlavaForConditionalGeneration.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                torch_dtype=torch.float16
            )
        else:
            print("⚙️  FP16 설정 (VRAM ~26GB)")
            self.model = LlavaForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )

        if torch.cuda.is_available():
            print(f"✅ 모델 로딩 완료!")
            print(f"📊 VRAM 사용량: {torch.cuda.memory_allocated() / 1024**3:.2f} GB\n")
        else:
            print("✅ 모델 로딩 완료! (CPU 모드)\n")

    def analyze_frame(
        self,
        image_path: str,
        prompt: str = None,
        language: str = "ko",
        max_tokens: int = 256
    ) -> Dict:
        """
        단일 이미지 분석

        Args:
            image_path: 이미지 파일 경로
            prompt: 커스텀 프롬프트
            language: 응답 언어
            max_tokens: 최대 토큰 수

        Returns:
            {'success': bool, 'description': str, 'path': str}
        """
        try:
            # 이미지 로드
            image = Image.open(image_path).convert('RGB')

            # 기본 프롬프트
            if not prompt:
                if language == "ko":
                    prompt = """USER: <image>
이 이미지를 한국어로 상세히 설명해주세요. 다음을 포함해주세요:
1. 주요 객체나 인물
2. 배경이나 장소
3. 화면에 보이는 텍스트
4. 전반적인 분위기

ASSISTANT:"""
                else:
                    prompt = """USER: <image>
Describe this image in detail, including:
1. Main objects or people
2. Background or location
3. Any visible text
4. Overall atmosphere

ASSISTANT:"""

            # 프롬프트 처리
            inputs = self.processor(
                text=prompt,
                images=image,
                return_tensors="pt"
            ).to(self.model.device)

            # 생성
            with torch.no_grad():
                output = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=0.7,
                    do_sample=True
                )

            # 디코딩
            description = self.processor.decode(
                output[0],
                skip_special_tokens=True
            )

            # "ASSISTANT:" 이후 텍스트만 추출
            if "ASSISTANT:" in description:
                description = description.split("ASSISTANT:")[-1].strip()

            return {
                'success': True,
                'description': description,
                'path': image_path
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'LLaVA analysis failed: {str(e)}',
                'path': image_path
            }

    def analyze_frames_batch(
        self,
        frames: List[Dict],
        prompt: str = None,
        language: str = "ko"
    ) -> List[Dict]:
        """
        여러 프레임 배치 분석

        Args:
            frames: [{'timestamp': float, 'path': str}]
            prompt: 커스텀 프롬프트
            language: 응답 언어

        Returns:
            [{'timestamp': float, 'path': str, 'description': str}]
        """
        results = []

        for idx, frame in enumerate(frames):
            print(f"🔍 [{idx+1}/{len(frames)}] 분석 중...")

            result = self.analyze_frame(
                frame['path'],
                prompt=prompt,
                language=language
            )

            result['timestamp'] = frame.get('timestamp', 0)
            results.append(result)

            if result['success']:
                timestamp = self._format_timestamp(result['timestamp'])
                print(f"✅ [{timestamp}] 완료")
            else:
                print(f"❌ 실패: {result.get('error', 'Unknown')}")

        return results

    def analyze_with_context(
        self,
        image_path: str,
        context: str,
        language: str = "ko"
    ) -> Dict:
        """
        컨텍스트와 함께 이미지 분석

        Args:
            image_path: 이미지 경로
            context: 추가 컨텍스트
            language: 응답 언어
        """
        if language == "ko":
            prompt = f"""USER: <image>
다음 컨텍스트를 참고하여 이미지를 분석해주세요:

{context}

이미지와 컨텍스트의 연결성을 설명해주세요.

ASSISTANT:"""
        else:
            prompt = f"""USER: <image>
Analyze this image with the following context:

{context}

Explain how the image relates to the context.

ASSISTANT:"""

        return self.analyze_frame(image_path, prompt=prompt)

    @staticmethod
    def _format_timestamp(seconds: float) -> str:
        """초를 MM:SS 형태로 변환"""
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"


# 테스트 코드
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python llava_analyzer.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    print("🦙 LLaVA 분석기 초기화...")
    analyzer = LLaVAAnalyzer(quantization="int4")

    print("\n🔍 이미지 분석 중...")
    result = analyzer.analyze_frame(image_path, language="ko")

    if result['success']:
        print(f"\n✅ 분석 완료:\n{result['description']}")
    else:
        print(f"\n❌ 분석 실패: {result['error']}")