#!/bin/bash
# FastAPI 서버 실행 스크립트

cd "$(dirname "$0")/.." || exit

echo "🚀 Starting YouTube Video Analysis API Server..."
echo "================================================"
echo ""

# 환경변수 로드
if [ -f .env ]; then
    echo "✅ Loading .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# 포트 설정 (기본값: 8000)
PORT=${PORT:-8000}

echo "📡 Server will run on: http://0.0.0.0:$PORT"
echo "📖 API Docs: http://localhost:$PORT/docs"
echo "📖 ReDoc: http://localhost:$PORT/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# 서버 실행 (타임아웃 설정: 30분)
python -m uvicorn src.api.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --reload \
    --timeout-keep-alive 1800 \
    --timeout-graceful-shutdown 30
