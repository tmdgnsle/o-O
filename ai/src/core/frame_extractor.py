"""
영상 프레임 추출 모듈
- yt-dlp로 영상 다운로드
- opencv로 프레임 추출
- scenedetect로 장면 전환 감지
"""
import os
import cv2
import yt_dlp
import logging
from typing import List, Dict, Optional
from pathlib import Path
import tempfile

logger = logging.getLogger(__name__)


class FrameExtractor:
    """영상 프레임 추출기"""

    def __init__(self, output_dir: str = None):
        """
        Args:
            output_dir: 프레임 저장 디렉토리 (None이면 임시 디렉토리)
        """
        if output_dir:
            self.output_dir = Path(output_dir)
            self.output_dir.mkdir(parents=True, exist_ok=True)
        else:
            self.output_dir = Path(tempfile.mkdtemp())

    def download_video(self, url: str) -> Optional[str]:
        """
        유튜브 영상 다운로드

        Args:
            url: 유튜브 URL

        Returns:
            다운로드된 파일 경로
        """
        try:
            output_path = self.output_dir / "video.mp4"

            ydl_opts = {
                'format': 'best[ext=mp4]',
                'outtmpl': str(output_path),
                'quiet': True,
                'no_warnings': True,
                # 여러 클라이언트 우선순위 시도 (android_creator가 가장 효과적)
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android_creator', 'android', 'ios', 'web'],
                        'skip': ['hls', 'dash']
                    }
                },
                # 추가 우회 옵션
                'nocheckcertificate': True,
                'no_color': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)

                return {
                    'success': True,
                    'path': str(output_path),
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'channel': info.get('uploader', 'Unknown'),
                    'thumbnail': info.get('thumbnail', None)
                }

        except Exception as e:
            return {
                'success': False,
                'error': f'Download failed: {str(e)}'
            }

    def extract_frames_uniform(
        self,
        video_path: str,
        interval_seconds: int = 60,
        max_frames: int = 20
    ) -> List[Dict]:
        """
        균등 간격으로 프레임 추출

        Args:
            video_path: 영상 파일 경로
            interval_seconds: 추출 간격 (초)
            max_frames: 최대 프레임 수

        Returns:
            [{'timestamp': float, 'path': str, 'frame_number': int}]
        """
        try:
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps

            # 프레임 간격 계산
            frame_interval = int(fps * interval_seconds)

            frames = []
            frame_count = 0

            while cap.isOpened() and len(frames) < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break

                # 지정된 간격마다 프레임 저장
                if frame_count % frame_interval == 0:
                    timestamp = frame_count / fps
                    frame_path = self.output_dir / f"frame_{frame_count:06d}.jpg"

                    cv2.imwrite(str(frame_path), frame)

                    frames.append({
                        'timestamp': timestamp,
                        'path': str(frame_path),
                        'frame_number': frame_count
                    })

                frame_count += 1

            cap.release()

            return {
                'success': True,
                'frames': frames,
                'total_frames': len(frames),
                'duration': duration
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Frame extraction failed: {str(e)}'
            }

    def extract_frames_scene_detect(
        self,
        video_path: str,
        threshold: float = 27.0,
        max_frames: int = 20
    ) -> List[Dict]:
        """
        장면 전환 감지로 프레임 추출

        Args:
            video_path: 영상 파일 경로
            threshold: 장면 전환 임계값 (낮을수록 민감)
            max_frames: 최대 프레임 수

        Returns:
            [{'timestamp': float, 'path': str}]
        """
        try:
            from scenedetect import VideoManager, SceneManager
            from scenedetect.detectors import ContentDetector

            video_manager = VideoManager([video_path])
            scene_manager = SceneManager()
            scene_manager.add_detector(ContentDetector(threshold=threshold))

            # 장면 감지
            video_manager.set_downscale_factor()
            video_manager.start()
            scene_manager.detect_scenes(frame_source=video_manager)

            scene_list = scene_manager.get_scene_list()
            video_manager.release()

            # 각 장면의 시작 프레임 추출
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)

            frames = []
            for idx, scene in enumerate(scene_list[:max_frames]):
                start_frame = scene[0].get_frames()
                timestamp = start_frame / fps

                cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
                ret, frame = cap.read()

                if ret:
                    frame_path = self.output_dir / f"scene_{idx:03d}.jpg"
                    cv2.imwrite(str(frame_path), frame)

                    frames.append({
                        'timestamp': timestamp,
                        'path': str(frame_path),
                        'scene_number': idx
                    })

            cap.release()

            return {
                'success': True,
                'frames': frames,
                'total_scenes': len(scene_list)
            }

        except Exception as e:
            # scenedetect 실패시 uniform 방식으로 fallback
            logger.info(f"Scene detection failed: {e}, falling back to uniform extraction")
            return self.extract_frames_uniform(video_path, max_frames=max_frames)

    def get_thumbnail(self, video_path: str) -> Optional[str]:
        """
        영상 썸네일 추출 (첫 프레임)

        Args:
            video_path: 영상 파일 경로

        Returns:
            썸네일 경로
        """
        try:
            cap = cv2.VideoCapture(video_path)
            ret, frame = cap.read()
            cap.release()

            if ret:
                thumb_path = self.output_dir / "thumbnail.jpg"
                cv2.imwrite(str(thumb_path), frame)
                return str(thumb_path)

            return None

        except Exception as e:
            logger.info(f"Thumbnail extraction failed: {e}")
            return None

    def cleanup(self):
        """임시 파일 정리"""
        import shutil
        if self.output_dir.exists():
            shutil.rmtree(self.output_dir)


# 테스트 코드
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        logger.info("Usage: python frame_extractor.py <youtube_url>")
        sys.exit(1)

    url = sys.argv[1]

    extractor = FrameExtractor()

    logger.info("📥 영상 다운로드 중...")
    result = extractor.download_video(url)

    if result['success']:
        logger.info(f"✅ 다운로드 완료: {result['title']}")
        logger.info(f"⏱️  길이: {result['duration']:.0f}초")

        logger.info("\n🎞️  프레임 추출 중...")
        frames_result = extractor.extract_frames_uniform(
            result['path'],
            interval_seconds=30,
            max_frames=10
        )

        if frames_result['success']:
            logger.info(f"✅ {frames_result['total_frames']}개 프레임 추출 완료")
            for frame in frames_result['frames']:
                logger.info(f"  [{frame['timestamp']:.1f}s] {frame['path']}")
        else:
            logger.info(f"❌ 프레임 추출 실패: {frames_result['error']}")
    else:
        logger.info(f"❌ 다운로드 실패: {result['error']}")