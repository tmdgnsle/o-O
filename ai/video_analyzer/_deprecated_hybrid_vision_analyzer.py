"""
하이브리드 Vision Analyzer
- 유튜브: Gemini API (빠름)
- 개인 사진: LLaVA 로컬 (무료, 프라이버시)
"""
from typing import List, Dict, Optional, Literal
from .vision_analyzer import VisionAnalyzer
from .llava_analyzer import LLaVAAnalyzer
import os


class HybridVisionAnalyzer:
    """
    하이브리드 비전 분석기

    - 유튜브 영상: Gemini API 사용 (빠르고 정확)
    - 개인 이미지: LLaVA 로컬 사용 (완전 무료, 오프라인)
    """

    def __init__(
        self,
        gemini_api_key: str = None,
        llava_model: str = "llava-hf/llava-1.5-13b-hf",
        llava_quantization: str = "int4",
        lazy_load: bool = True
    ):
        """
        Args:
            gemini_api_key: Gemini API 키 (None이면 환경변수)
            llava_model: LLaVA 모델 이름
            llava_quantization: LLaVA 양자화 ("int4", "int8", None)
            lazy_load: True면 필요할 때만 모델 로드
        """
        self.gemini_api_key = gemini_api_key
        self.llava_model = llava_model
        self.llava_quantization = llava_quantization

        # API 분석기는 바로 초기화 (가벼움)
        try:
            self.gemini_analyzer = VisionAnalyzer(api_key=gemini_api_key)
            self.gemini_available = True
        except Exception as e:
            print(f"⚠️  Gemini API 초기화 실패: {e}")
            self.gemini_available = False

        # LLaVA는 lazy loading (무거움)
        self.llava_analyzer = None
        self.llava_loaded = False

        if not lazy_load:
            self._load_llava()

    def _load_llava(self):
        """LLaVA 모델 로드"""
        if not self.llava_loaded:
            print("\n🦙 LLaVA 로컬 모델 로딩 중...")
            try:
                self.llava_analyzer = LLaVAAnalyzer(
                    model_name=self.llava_model,
                    quantization=self.llava_quantization
                )
                self.llava_loaded = True
                print("✅ LLaVA 로드 완료!\n")
            except Exception as e:
                print(f"❌ LLaVA 로드 실패: {e}\n")
                self.llava_loaded = False

    def analyze_frame(
        self,
        image_path: str,
        source: Literal["youtube", "local"] = "youtube",
        prompt: str = None,
        language: str = "ko",
        force_method: Literal["gemini", "llava", "auto"] = "auto"
    ) -> Dict:
        """
        이미지 분석 (자동 또는 수동 선택)

        Args:
            image_path: 이미지 경로
            source: "youtube" (Gemini 우선) or "local" (LLaVA 우선)
            prompt: 커스텀 프롬프트
            language: 응답 언어
            force_method: "auto" (자동), "gemini", "llava"

        Returns:
            {'success': bool, 'description': str, 'method': str}
        """
        # 강제 방법 지정
        if force_method == "gemini":
            return self._analyze_with_gemini(image_path, prompt, language)
        elif force_method == "llava":
            return self._analyze_with_llava(image_path, prompt, language)

        # 자동 선택
        if source == "youtube":
            # 유튜브는 Gemini 우선, 실패시 LLaVA
            if self.gemini_available:
                result = self._analyze_with_gemini(image_path, prompt, language)
                if result['success']:
                    return result
                print("⚠️  Gemini 실패, LLaVA로 재시도...")

            return self._analyze_with_llava(image_path, prompt, language)

        else:  # source == "local"
            # 개인 이미지는 LLaVA 우선 (프라이버시)
            result = self._analyze_with_llava(image_path, prompt, language)
            if result['success']:
                return result

            # LLaVA 실패시 Gemini
            if self.gemini_available:
                print("⚠️  LLaVA 실패, Gemini로 재시도...")
                return self._analyze_with_gemini(image_path, prompt, language)

            return result

    def _analyze_with_gemini(
        self,
        image_path: str,
        prompt: str = None,
        language: str = "ko"
    ) -> Dict:
        """Gemini API로 분석"""
        if not self.gemini_available:
            return {
                'success': False,
                'error': 'Gemini API not available',
                'method': 'gemini'
            }

        try:
            result = self.gemini_analyzer.analyze_frame(
                image_path,
                prompt=prompt,
                language=language
            )
            result['method'] = 'gemini'
            return result
        except Exception as e:
            return {
                'success': False,
                'error': f'Gemini error: {str(e)}',
                'method': 'gemini'
            }

    def _analyze_with_llava(
        self,
        image_path: str,
        prompt: str = None,
        language: str = "ko"
    ) -> Dict:
        """LLaVA 로컬로 분석"""
        # Lazy loading
        if not self.llava_loaded:
            self._load_llava()

        if not self.llava_loaded:
            return {
                'success': False,
                'error': 'LLaVA not available',
                'method': 'llava'
            }

        try:
            result = self.llava_analyzer.analyze_frame(
                image_path,
                prompt=prompt,
                language=language
            )
            result['method'] = 'llava'
            return result
        except Exception as e:
            return {
                'success': False,
                'error': f'LLaVA error: {str(e)}',
                'method': 'llava'
            }

    def analyze_frames_batch(
        self,
        frames: List[Dict],
        source: Literal["youtube", "local"] = "youtube",
        prompt: str = None,
        language: str = "ko"
    ) -> List[Dict]:
        """
        배치 분석

        Args:
            frames: [{'timestamp': float, 'path': str}]
            source: "youtube" or "local"
            prompt: 커스텀 프롬프트
            language: 응답 언어

        Returns:
            [{'timestamp': float, 'description': str, 'method': str}]
        """
        results = []

        for frame in frames:
            result = self.analyze_frame(
                frame['path'],
                source=source,
                prompt=prompt,
                language=language
            )
            result['timestamp'] = frame.get('timestamp', 0)
            results.append(result)

        return results

    def get_stats(self) -> Dict:
        """현재 상태 정보"""
        return {
            'gemini_available': self.gemini_available,
            'llava_loaded': self.llava_loaded,
            'recommended_for_youtube': 'gemini' if self.gemini_available else 'llava',
            'recommended_for_local': 'llava' if self.llava_loaded else 'gemini'
        }


# 테스트 코드
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python hybrid_vision_analyzer.py <image_path> [youtube|local]")
        sys.exit(1)

    image_path = sys.argv[1]
    source = sys.argv[2] if len(sys.argv) > 2 else "youtube"

    print("🔧 하이브리드 분석기 초기화...")
    analyzer = HybridVisionAnalyzer(lazy_load=True)

    print(f"\n📊 현재 상태:")
    stats = analyzer.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")

    print(f"\n🔍 이미지 분석 중 (소스: {source})...")
    result = analyzer.analyze_frame(image_path, source=source)

    if result['success']:
        print(f"\n✅ 분석 완료 (방법: {result['method']}):")
        print(result['description'])
    else:
        print(f"\n❌ 분석 실패: {result['error']}")