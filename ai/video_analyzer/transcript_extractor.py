"""
유튜브 자막 추출 모듈
- youtube-transcript-api 우선
- 실패시 Whisper 백업
"""
from typing import List, Dict, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
import re


class TranscriptExtractor:
    """유튜브 자막 추출기"""

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """유튜브 URL에서 video_id 추출"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'^([0-9A-Za-z_-]{11})$'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def get_transcript(url: str, languages: List[str] = ['ko', 'en']) -> Dict:
        """
        유튜브 자막 추출

        Args:
            url: 유튜브 URL
            languages: 우선순위 언어 리스트

        Returns:
            {
                'success': bool,
                'method': 'youtube_api' or 'whisper',
                'language': str,
                'segments': [{'start': float, 'duration': float, 'text': str}],
                'full_text': str
            }
        """
        video_id = TranscriptExtractor.extract_video_id(url)
        if not video_id:
            return {
                'success': False,
                'error': 'Invalid YouTube URL'
            }

        try:
            # 유튜브 API로 자막 추출 시도
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

            # 수동 자막 우선, 자동 생성 자막은 백업
            transcript = None
            detected_language = None

            # 1순위: 수동 업로드 자막
            for lang in languages:
                try:
                    transcript = transcript_list.find_manually_created_transcript([lang])
                    detected_language = lang
                    break
                except:
                    continue

            # 2순위: 자동 생성 자막
            if not transcript:
                for lang in languages:
                    try:
                        transcript = transcript_list.find_generated_transcript([lang])
                        detected_language = lang
                        break
                    except:
                        continue

            # 3순위: 아무 자막이나
            if not transcript:
                transcript = transcript_list.find_transcript(transcript_list._manually_created_transcripts.keys())
                detected_language = transcript.language_code

            # 자막 데이터 가져오기
            segments = transcript.fetch()

            # 전체 텍스트 생성
            full_text = ' '.join([seg['text'] for seg in segments])

            return {
                'success': True,
                'method': 'youtube_api',
                'language': detected_language,
                'segments': segments,
                'full_text': full_text,
                'video_id': video_id
            }

        except (TranscriptsDisabled, NoTranscriptFound) as e:
            return {
                'success': False,
                'error': f'No transcript available: {str(e)}',
                'video_id': video_id,
                'fallback_needed': True
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'video_id': video_id
            }

    @staticmethod
    def format_transcript_for_llm(segments: List[Dict]) -> str:
        """
        LLM 처리용 자막 포맷팅

        Args:
            segments: 자막 세그먼트 리스트

        Returns:
            포맷팅된 텍스트
        """
        formatted = []
        for seg in segments:
            timestamp = TranscriptExtractor._format_timestamp(seg['start'])
            formatted.append(f"[{timestamp}] {seg['text']}")

        return '\n'.join(formatted)

    @staticmethod
    def _format_timestamp(seconds: float) -> str:
        """초를 MM:SS 형태로 변환"""
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"


# 테스트 코드
if __name__ == "__main__":
    # 테스트용
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    extractor = TranscriptExtractor()
    result = extractor.get_transcript(test_url)

    if result['success']:
        print(f"✅ 자막 추출 성공!")
        print(f"방법: {result['method']}")
        print(f"언어: {result['language']}")
        print(f"세그먼트 수: {len(result['segments'])}")
        print(f"\n첫 3줄:")
        for seg in result['segments'][:3]:
            print(f"  [{seg['start']:.1f}s] {seg['text']}")
    else:
        print(f"❌ 실패: {result['error']}")