#!/bin/bash
# 실시간 STT 시스템 의존성 설치 스크립트

echo "🔧 실시간 STT 시스템 의존성 설치 시작..."
echo "================================================"

# PortAudio 설치 (sounddevice 필요)
echo ""
echo "📦 PortAudio 설치 중..."
apt-get update
apt-get install -y portaudio19-dev python3-pyaudio

echo ""
echo "✅ 시스템 의존성 설치 완료!"
echo ""
echo "이제 Python 패키지를 설치하세요:"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo ""
