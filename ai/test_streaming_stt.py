#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
실시간 스트리밍 STT (Speech-to-Text)
말하면서 바로바로 텍스트로 변환
"""
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import sys
import io

# Windows에서 UTF-8 강제 설정
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import whisper
import sounddevice as sd
import numpy as np
import queue
import threading
from datetime import datetime


class StreamingSTT:
    """실시간 스트리밍 음성 인식"""

    def __init__(self, model_name="base", language="ko", chunk_duration=2):
        """
        Args:
            model_name: whisper 모델 (tiny 추천 - 가장 빠름)
            language: 언어 코드 (ko, en, ja, etc.)
            chunk_duration: 음성 청크 길이 (초) - 짧을수록 빠르지만 정확도 하락
        """
        print(f"🔄 Whisper 모델 로딩 중... (모델: {model_name})")
        self.model = whisper.load_model(model_name)
        self.language = language
        self.chunk_duration = chunk_duration
        self.sample_rate = 16000
        self.audio_queue = queue.Queue()
        self.is_running = False

        print(f"✅ Whisper 모델 로딩 완료!")
        print(f"📊 청크 길이: {chunk_duration}초")
        print(f"📊 샘플레이트: {self.sample_rate}Hz")

    def audio_callback(self, indata, frames, time, status):
        """오디오 스트림 콜백"""
        if status:
            print(f"⚠️  오디오 상태: {status}", file=sys.stderr)

        # 오디오 데이터를 큐에 추가
        self.audio_queue.put(indata.copy())

    def process_audio_stream(self):
        """오디오 스트림을 실시간으로 처리"""
        buffer = []
        chunk_samples = int(self.chunk_duration * self.sample_rate)

        print("\n💬 실시간 STT 시작! (Ctrl+C로 종료)")
        print("─" * 60)

        while self.is_running:
            try:
                # 큐에서 오디오 데이터 가져오기
                data = self.audio_queue.get(timeout=0.1)
                buffer.extend(data.flatten())

                # 버퍼가 청크 크기에 도달하면 처리
                if len(buffer) >= chunk_samples:
                    audio_chunk = np.array(buffer[:chunk_samples], dtype=np.float32)
                    buffer = buffer[chunk_samples:]

                    # 음성 활동 감지 (VAD) - 조용하면 건너뛰기
                    if np.abs(audio_chunk).max() < 0.01:
                        continue

                    # Whisper로 인식 (한글 강제)
                    try:
                        result = self.model.transcribe(
                            audio_chunk,
                            language=self.language,  # 'ko' 강제
                            fp16=False,
                            verbose=False,
                            task='transcribe',
                            no_speech_threshold=0.6,  # 음성 감지 임계값 상향 (노이즈 감소)
                            compression_ratio_threshold=2.4,  # 압축률 체크
                            temperature=0.0,  # 온도 0으로 설정 (가장 확실한 결과만)
                            beam_size=5,  # 빔 서치 크기
                            best_of=5,  # 최상의 결과 선택
                        )

                        text = result['text'].strip()

                        # 필터링: initial_prompt와 같거나 너무 짧으면 무시
                        if text and text != "한국어로 말하고 있습니다." and len(text) > 1:
                            # 한글 비율 체크 (최소 50% 이상 한글이어야 함)
                            korean_chars = sum(1 for c in text if '가' <= c <= '힣')
                            korean_ratio = korean_chars / len(text.replace(' ', ''))

                            if korean_ratio >= 0.3:  # 30% 이상 한글
                                timestamp = datetime.now().strftime("%H:%M:%S")
                                confidence = result.get('language_probability', 0)
                                print(f"[{timestamp}] {text} (신뢰도: {confidence:.2f})")
                                sys.stdout.flush()
                            else:
                                print(f"⚠️  한글 비율 낮음 ({korean_ratio:.1%}): {text}", file=sys.stderr)

                    except Exception as e:
                        print(f"⚠️  인식 오류: {e}", file=sys.stderr)
                        continue

            except queue.Empty:
                continue
            except KeyboardInterrupt:
                print("\n⚠️  Ctrl+C 감지됨, 종료 중...")
                self.is_running = False
                break

    def start_streaming(self):
        """실시간 스트리밍 시작"""
        self.is_running = True

        # 현재 사용 중인 마이크 정보 출력
        try:
            current_device = sd.query_devices(kind='input')
            print(f"\n🎤 사용 중인 마이크:")
            print(f"   이름: {current_device['name']}")
            print(f"   채널: {current_device['max_input_channels']}")
            print(f"   샘플레이트: {current_device['default_samplerate']} Hz")
            print(f"   장치 인덱스: {current_device['index']}")
        except Exception as e:
            print(f"\n⚠️  마이크 정보를 가져올 수 없습니다: {e}")

        # 오디오 스트림 처리 스레드 시작
        process_thread = threading.Thread(target=self.process_audio_stream)
        process_thread.daemon = True
        process_thread.start()

        # 마이크 입력 스트림 시작
        try:
            with sd.InputStream(
                samplerate=self.sample_rate,
                channels=1,
                dtype='float32',
                callback=self.audio_callback,
                blocksize=int(self.sample_rate * 0.1)  # 100ms 블록
            ):
                print("\n✅ 마이크 준비 완료! 녹음 시작...")
                print("   (Ctrl+C를 눌러 종료하세요)\n")

                # KeyboardInterrupt를 제대로 받기 위해 메인 스레드에서 대기
                try:
                    while self.is_running:
                        process_thread.join(timeout=0.1)
                        if not process_thread.is_alive():
                            break
                except KeyboardInterrupt:
                    print("\n\n⚠️  사용자가 중단했습니다. 종료 중...")
                    self.is_running = False

        except KeyboardInterrupt:
            print("\n\n⚠️  종료 중...")
            self.is_running = False
        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            self.is_running = False
        finally:
            self.is_running = False
            if process_thread.is_alive():
                process_thread.join(timeout=1.0)

    def stop(self):
        """스트리밍 중지"""
        self.is_running = False


def test_streaming_stt(model="tiny", chunk_duration=2):
    """
    실시간 스트리밍 STT 테스트

    Args:
        model: whisper 모델 (tiny 추천 - 실시간용)
        chunk_duration: 음성 청크 길이 (초)
                       - 짧을수록: 빠른 응답, 낮은 정확도
                       - 길수록: 느린 응답, 높은 정확도
                       - 추천: 1-3초
    """
    print("\n" + "="*60)
    print("🎯 실시간 스트리밍 STT")
    print("="*60)
    print(f"모델: {model}")
    print(f"청크: {chunk_duration}초")
    print(f"언어: 한국어")
    print("\n💡 TIP:")
    print("  - 더 빠른 응답: --chunk 1 --model tiny")
    print("  - 더 높은 정확도: --chunk 3 --model base")
    print("="*60)

    stt = StreamingSTT(
        model_name=model,
        language="ko",
        chunk_duration=chunk_duration
    )

    try:
        stt.start_streaming()
    except KeyboardInterrupt:
        print("\n\n✅ 종료되었습니다.")


def test_mic_devices():
    """마이크 장치 테스트"""
    print("\n" + "="*60)
    print("🎤 오디오 장치 목록")
    print("="*60)

    devices = sd.query_devices()
    print("\n사용 가능한 입력 장치:")
    print("-" * 60)

    has_input = False
    for i, device in enumerate(devices):
        if device['max_input_channels'] > 0:
            has_input = True
            is_default = "(기본)" if i == sd.default.device[0] else ""
            print(f"[{i}] {device['name']} {is_default}")
            print(f"    채널: {device['max_input_channels']}")
            print(f"    샘플레이트: {device['default_samplerate']} Hz")
            print()

    if not has_input:
        print("❌ 입력 장치를 찾을 수 없습니다!")
        print("💡 GPU 서버에는 마이크가 없을 수 있습니다.")
    else:
        default_input = sd.query_devices(kind='input')
        print(f"✅ 기본 입력 장치: {default_input['name']}")


def test_audio_input(duration=3):
    """오디오 입력 테스트 (녹음 레벨 확인)"""
    print("\n" + "="*60)
    print("🎤 오디오 입력 테스트")
    print("="*60)
    print(f"\n{duration}초 동안 말씀해보세요...")
    print("(음성 레벨을 표시합니다)")
    print("-" * 60)

    sample_rate = 16000

    try:
        recording = sd.rec(
            int(duration * sample_rate),
            samplerate=sample_rate,
            channels=1,
            dtype='float32'
        )

        # 실시간 레벨 모니터링
        import time
        start_time = time.time()
        while time.time() - start_time < duration:
            time.sleep(0.1)
            current_frame = int((time.time() - start_time) * sample_rate)
            if current_frame < len(recording):
                level = np.abs(recording[max(0, current_frame-1600):current_frame]).max()
                bar_length = int(level * 50)
                bar = "█" * bar_length
                print(f"\r🔊 {bar:<50} {level:.3f}", end="", flush=True)

        sd.wait()
        print("\n\n✅ 테스트 완료!")

        max_level = np.abs(recording).max()
        avg_level = np.abs(recording).mean()

        print(f"\n📊 통계:")
        print(f"  최대 레벨: {max_level:.3f}")
        print(f"  평균 레벨: {avg_level:.3f}")

        if max_level < 0.01:
            print("\n⚠️  음성 레벨이 너무 낮습니다!")
            print("💡 마이크 볼륨을 확인하거나 더 크게 말씀해보세요.")
        else:
            print("\n✅ 음성 입력이 정상입니다!")

    except Exception as e:
        print(f"\n❌ 오류: {e}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="실시간 스트리밍 STT")
    parser.add_argument(
        "--mode",
        choices=["stream", "devices", "test"],
        default="stream",
        help="모드 선택 (stream: 스트리밍, devices: 장치 확인, test: 입력 테스트)"
    )
    parser.add_argument(
        "--model",
        choices=["tiny", "base", "small"],
        default="tiny",
        help="Whisper 모델 (실시간용은 tiny 추천)"
    )
    parser.add_argument(
        "--chunk",
        type=float,
        default=2.0,
        help="음성 청크 길이 (초) - 1~3 추천"
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=3,
        help="입력 테스트 시간 (초)"
    )

    args = parser.parse_args()

    try:
        if args.mode == "devices":
            # 장치 목록 확인
            test_mic_devices()

        elif args.mode == "test":
            # 오디오 입력 테스트
            test_audio_input(duration=args.duration)

        elif args.mode == "stream":
            # 실시간 스트리밍 STT
            test_streaming_stt(
                model=args.model,
                chunk_duration=args.chunk
            )

    except KeyboardInterrupt:
        print("\n\n⚠️  사용자가 중단했습니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
