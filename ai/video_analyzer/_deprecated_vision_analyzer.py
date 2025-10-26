"""
Gemini Vision API를 사용한 이미지 분석 모듈
"""
import os
import google.generativeai as genai
from typing import List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv
import base64
from PIL import Image

load_dotenv()


class VisionAnalyzer:
    """Gemini Vision API 이미지 분석기"""

    def __init__(self, api_key: str = None):
        """
        Args:
            api_key: Gemini API 키 (None이면 환경변수에서 로드)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        genai.configure(api_key=self.api_key)
        # gemini-2.0-flash 사용 (빠르고 비용 효율적: $0.10/1M input, $0.40/1M output)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def analyze_frame(
        self,
        image_path: str,
        prompt: str = None,
        language: str = "ko"
    ) -> Dict:
        """
        단일 이미지 분석

        Args:
            image_path: 이미지 파일 경로
            prompt: 커스텀 프롬프트 (None이면 기본 프롬프트 사용)
            language: 응답 언어

        Returns:
            {
                'success': bool,
                'description': str,
                'error': str (optional)
            }
        """
        try:
            # 이미지 로드
            img = Image.open(image_path)

            # 기본 프롬프트
            if not prompt:
                if language == "ko":
                    prompt = """이 이미지를 상세히 설명해주세요. 다음 내용을 포함해주세요:
1. 주요 객체나 인물
2. 배경이나 장소
3. 화면에 보이는 텍스트 (있다면)
4. 전반적인 분위기나 상황

간결하고 명확하게 설명해주세요."""
                else:
                    prompt = """Describe this image in detail, including:
1. Main objects or people
2. Background or location
3. Any visible text
4. Overall atmosphere or situation

Be concise and clear."""

            # Gemini로 분석
            response = self.model.generate_content([prompt, img])

            return {
                'success': True,
                'description': response.text,
                'path': image_path
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Vision analysis failed: {str(e)}',
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
            frames: [{'timestamp': float, 'path': str}] 형식의 리스트
            prompt: 커스텀 프롬프트
            language: 응답 언어

        Returns:
            [{'timestamp': float, 'path': str, 'description': str, 'success': bool}]
        """
        results = []

        for frame in frames:
            result = self.analyze_frame(
                frame['path'],
                prompt=prompt,
                language=language
            )

            # 타임스탬프 추가
            result['timestamp'] = frame.get('timestamp', 0)

            results.append(result)

            # 진행 상황 출력
            if result['success']:
                timestamp = self._format_timestamp(result['timestamp'])
                print(f"✅ [{timestamp}] 분석 완료")
            else:
                print(f"❌ [{timestamp}] 분석 실패: {result.get('error', 'Unknown')}")

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
            context: 추가 컨텍스트 (예: 자막 내용)
            language: 응답 언어

        Returns:
            분석 결과
        """
        if language == "ko":
            prompt = f"""이 이미지를 다음 컨텍스트와 함께 분석해주세요.

컨텍스트:
{context}

이미지에서 보이는 내용과 컨텍스트가 어떻게 연결되는지 설명해주세요."""
        else:
            prompt = f"""Analyze this image with the following context.

Context:
{context}

Explain how the image relates to the context."""

        return self.analyze_frame(image_path, prompt=prompt, language=language)

    def extract_text_from_image(self, image_path: str) -> Dict:
        """
        이미지에서 텍스트 추출 (OCR)

        Args:
            image_path: 이미지 경로

        Returns:
            {'success': bool, 'text': str}
        """
        try:
            img = Image.open(image_path)

            prompt = """이 이미지에 보이는 모든 텍스트를 정확히 추출해주세요.
- 텍스트만 추출하고 다른 설명은 필요 없습니다.
- 텍스트가 없다면 "텍스트 없음"이라고 응답하세요."""

            response = self.model.generate_content([prompt, img])

            return {
                'success': True,
                'text': response.text,
                'path': image_path
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'OCR failed: {str(e)}',
                'path': image_path
            }

    def summarize_visual_content(
        self,
        analyses: List[Dict],
        video_title: str = ""
    ) -> str:
        """
        여러 프레임 분석 결과를 요약

        Args:
            analyses: analyze_frames_batch의 결과
            video_title: 영상 제목

        Returns:
            요약된 비주얼 콘텐츠 설명
        """
        summary_parts = []

        if video_title:
            summary_parts.append(f"영상 제목: {video_title}\n")

        summary_parts.append("=== 주요 장면 분석 ===\n")

        for analysis in analyses:
            if analysis['success']:
                timestamp = self._format_timestamp(analysis['timestamp'])
                desc = analysis['description']
                summary_parts.append(f"[{timestamp}] {desc}\n")

        return '\n'.join(summary_parts)

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
        print("Usage: python vision_analyzer.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    analyzer = VisionAnalyzer()

    print("🔍 이미지 분석 중...")
    result = analyzer.analyze_frame(image_path)

    if result['success']:
        print(f"\n✅ 분석 완료:\n{result['description']}")
    else:
        print(f"\n❌ 분석 실패: {result['error']}")

    # OCR 테스트
    print("\n📝 텍스트 추출 중...")
    ocr_result = analyzer.extract_text_from_image(image_path)

    if ocr_result['success']:
        print(f"✅ 추출 완료:\n{ocr_result['text']}")
    else:
        print(f"❌ 추출 실패: {ocr_result['error']}")