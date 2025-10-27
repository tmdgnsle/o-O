#!/usr/bin/env python3
"""
STT (자막 추출) 테스트 스크립트
"""
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
import re
from typing import Optional, List, Dict


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


def test_transcript(url: str, languages: List[str] = ['ko', 'en']):
    """자막 추출 테스트"""
    print(f"\n{'='*60}")
    print(f"🎬 테스트 URL: {url}")
    print(f"{'='*60}\n")

    # Video ID 추출
    video_id = extract_video_id(url)
    if not video_id:
        print("❌ 잘못된 YouTube URL")
        return

    print(f"📝 Video ID: {video_id}")

    try:
        # YouTube API로 자막 추출
        api = YouTubeTranscriptApi()

        fetched_transcript = None
        detected_language = None

        # 우선순위대로 언어 시도
        for lang in languages:
            try:
                print(f"🔍 {lang} 자막 검색 중...")
                fetched_transcript = api.fetch(video_id, languages=[lang])
                detected_language = lang
                print(f"✅ {lang} 자막 발견!")
                break
            except:
                print(f"⚠️  {lang} 자막 없음")
                continue

        if not fetched_transcript:
            print("❌ 자막을 찾을 수 없습니다.")
            print("💡 Whisper STT가 필요합니다 (구현 예정)")
            return

        # 세그먼트로 변환
        segments = []
        for snippet in fetched_transcript:
            segments.append({
                'text': snippet.text,
                'start': snippet.start,
                'duration': snippet.duration
            })

        # 결과 출력
        print(f"\n{'='*60}")
        print(f"✅ 자막 추출 성공!")
        print(f"{'='*60}")
        print(f"📌 언어: {detected_language}")
        print(f"📌 전체 세그먼트 수: {len(segments)}")
        print(f"📌 총 길이: {segments[-1]['start'] + segments[-1]['duration']:.1f}초")

        # 처음 5줄 미리보기
        print(f"\n{'─'*60}")
        print(f"📄 처음 5줄 미리보기:")
        print(f"{'─'*60}")
        for i, seg in enumerate(segments[:5]):
            timestamp = f"{int(seg['start']//60):02d}:{int(seg['start']%60):02d}"
            print(f"[{timestamp}] {seg['text']}")

        if len(segments) > 5:
            print(f"... (총 {len(segments) - 5}줄 더 있음)")

        # 전체 텍스트 길이
        full_text = ' '.join([seg['text'] for seg in segments])
        print(f"\n📊 전체 텍스트 길이: {len(full_text)} 글자")

        return {
            'success': True,
            'method': 'youtube_api',
            'language': detected_language,
            'segments': segments,
            'full_text': full_text
        }

    except (TranscriptsDisabled, NoTranscriptFound) as e:
        print(f"❌ 자막 없음: {str(e)}")
        print("💡 Whisper STT가 필요합니다")
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")


if __name__ == "__main__":
    # 테스트할 영상 URL들
    test_videos = [
        # 예시: 한글 자막이 있는 영상
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Astley (영어)

        # 원하는 영상 URL을 여기에 추가하세요
        # "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    ]

    print("\n" + "🎯 STT (자막 추출) 테스트 시작" + "\n")

    for url in test_videos:
        test_transcript(url)
        print("\n")
