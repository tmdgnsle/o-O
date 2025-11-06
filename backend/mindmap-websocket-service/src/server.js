/**
 * ========================================
 * o-O Mindmap 실시간 협업 WebSocket 서버
 * ========================================
 *
 * 이 서버의 역할:
 * 1. 여러 사용자가 동시에 마인드맵을 편집할 수 있게 함 (실시간 동기화)
 * 2. 다른 사용자의 커서 위치를 실시간으로 공유
 * 3. Figma처럼 "/" 키로 임시 채팅 가능
 * 4. 모든 변경사항을 Kafka로 전송하여 MongoDB에 영구 저장
 *
 * 기술 스택:
 * - Y.js: CRDT 알고리즘 기반 실시간 협업 (충돌 없이 자동 병합)
 * - WebSocket: 실시간 양방향 통신
 * - Express: HTTP 서버 (헬스체크, 통계 API)
 * - Kafka: 변경사항 메시지 큐 (다른 서비스로 전달)
 *
 * 연결 방법:
 * ws://localhost:3000/ws?workspace=123
 */

import 'dotenv/config';  // .env 파일에서 환경변수 로드
import express from 'express';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';  // Y.js WebSocket 유틸
import * as Y from 'yjs';
import http from 'http';
import { logger } from './utils/logger.js';
import { ydocManager } from './yjs/ydoc-manager.js';
import { awarenessManager } from './yjs/awareness.js';
import { kafkaProducer } from './kafka/producer.js';
import { mongodb } from './db/mongodb.js';

const app = express();
const PORT = process.env.PORT || 3000;  // 기본 포트 3000

// ===== HTTP 엔드포인트 =====

/**
 * 헬스체크 엔드포인트
 * 모니터링 시스템(Kubernetes, AWS ECS 등)에서 서버 상태 확인용
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mindmap-websocket-service',
    timestamp: new Date().toISOString(),
    stats: {
      ydoc: ydocManager.getStats(),           // Y.Doc 통계 (워크스페이스 수, 노드 수 등)
      awareness: awarenessManager.getStats(),  // Awareness 통계 (접속자 수)
      kafka: kafkaProducer.getStatus(),        // Kafka 연결 상태
      mongodb: mongodb.getStatus(),            // MongoDB 연결 상태
    },
  });
});

/**
 * 통계 정보 엔드포인트
 * 개발/디버깅용 - 현재 서버 상태 상세 조회
 * GET /stats
 */
app.get('/stats', (req, res) => {
  res.json({
    ydoc: ydocManager.getStats(),
    awareness: awarenessManager.getStats(),
    kafka: kafkaProducer.getStatus(),
    mongodb: mongodb.getStatus(),
  });
});

// ===== WebSocket 서버 설정 =====

// HTTP 서버 생성 (Express 앱을 기반으로)
const server = http.createServer(app);

// WebSocket 서버 생성 (HTTP 서버에 연결)
const wss = new WebSocketServer({
  server,       // HTTP 서버에 WebSocket 서버 연결
  path: '/ws',  // WebSocket 엔드포인트 경로
});

logger.info('WebSocket server created on path /ws');

/**
 * ============================================
 * WebSocket 연결 핸들러 (핵심 로직)
 * ============================================
 *
 * 클라이언트가 WebSocket으로 접속할 때마다 실행됨
 * URL 형식: ws://localhost:3000/ws?workspace=123
 *
 * 처리 흐름:
 * 1. workspace ID 추출 및 검증
 * 2. Y.Doc, Awareness 인스턴스 가져오기 (없으면 생성)
 * 3. Y.js WebSocket 연결 설정
 * 4. 이벤트 리스너 등록 (close, error, message)
 */
wss.on('connection', (conn, req) => {
  // URL에서 쿼리 파라미터 파싱
  const url = new URL(req.url, `http://${req.headers.host}`);
  const workspaceId = url.searchParams.get('workspace');  // workspace ID 추출

  // workspace ID가 없으면 연결 거부
  if (!workspaceId) {
    logger.warn('Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');  // WebSocket 연결 종료 (오류 코드 1008)
    return;
  }

  logger.info(`New connection to workspace ${workspaceId}`);

  // 해당 워크스페이스의 Y.Doc 가져오기 또는 생성
  // Y.Doc: 실제 마인드맵 데이터를 저장하는 CRDT 문서
  const ydoc = ydocManager.getDoc(workspaceId);

  // MongoDB에서 초기 데이터 로드 (첫 연결 시 한 번만)
  // 비동기로 실행하고 기다리지 않음 (Fire and forget)
  // 로드가 완료되면 Y.js가 자동으로 클라이언트에게 동기화해줌
  ydocManager.loadAndInitializeDoc(workspaceId).catch(error => {
    logger.error(`Failed to load workspace ${workspaceId}`, {
      error: error.message,
    });
  });

  // 해당 워크스페이스의 Awareness 가져오기 또는 생성
  // Awareness: 커서 위치, 사용자 정보 등 임시 상태 공유
  const awareness = awarenessManager.getAwareness(workspaceId, ydoc);

  // Y.js WebSocket 연결 설정 (y-websocket 라이브러리 유틸 사용)
  // 이 함수가 Y.js 프로토콜을 처리해줌 (동기화, 업데이트 전파 등)
  setupWSConnection(conn, req, {
    docName: `workspace-${workspaceId}`,           // 문서 이름
    gc: process.env.YDOC_GC_ENABLED === 'true',    // 가비지 컬렉션 활성화 여부
  });

  // 각 연결에 고유 ID 부여 (로깅용)
  const connectionId = Math.random().toString(36).substr(2, 9);

  /**
   * 연결 종료 이벤트 핸들러
   * 사용자가 브라우저를 닫거나 네트워크가 끊겼을 때 실행
   */
  conn.on('close', () => {
    logger.info(`Connection closed for workspace ${workspaceId}`, { connectionId });

    // 현재 워크스페이스 통계 확인
    const stats = ydocManager.getStats();
    const workspace = stats.workspaces.find(w => w.workspaceId === workspaceId);

    // 아직 Kafka로 전송되지 않은 변경사항이 있으면 즉시 전송
    // (사용자가 나갈 때 변경사항이 손실되지 않도록)
    if (workspace && workspace.pendingChanges > 0) {
      logger.info(`Flushing pending changes for workspace ${workspaceId} on disconnect`);
      kafkaProducer.sendImmediately(workspaceId);
    }
  });

  /**
   * WebSocket 에러 핸들러
   * 네트워크 오류, 프로토콜 오류 등 발생 시 실행
   */
  conn.on('error', (error) => {
    logger.error(`WebSocket error for workspace ${workspaceId}`, {
      error: error.message,
      connectionId,
    });
  });

  /**
   * 커스텀 메시지 핸들러 (Awareness 이벤트)
   * Y.js 프로토콜 외에 추가로 정의한 커스텀 메시지 처리
   * 예: 커서 이동, 임시 채팅, 사용자 정보 업데이트
   */
  conn.on('message', (message) => {
    try {
      // JSON 메시지 파싱 시도
      const data = JSON.parse(message.toString());

      // type이 'awareness'인 커스텀 메시지인 경우 처리
      if (data.type === 'awareness') {
        handleAwarenessMessage(workspaceId, connectionId, data);
      }
    } catch (error) {
      // JSON 파싱 실패 = Y.js 바이너리 프로토콜 메시지
      // Y.js가 자동으로 처리하므로 무시
    }
  });

  // 클라이언트에게 연결 성공 메시지 전송
  conn.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    workspaceId,
    connectionId,
    timestamp: new Date().toISOString(),
  }));
});

/**
 * ============================================
 * Awareness 커스텀 메시지 핸들러
 * ============================================
 *
 * 클라이언트가 보낸 Awareness 관련 메시지 처리
 * 메시지 형식: { type: 'awareness', event: 'cursor:move', data: {...} }
 *
 * 지원하는 이벤트:
 * - cursor:move: 커서 위치 업데이트
 * - chat:temp: 임시 채팅 메시지 (Figma "/" 기능)
 * - chat:clear: 임시 채팅 제거
 * - user:info: 사용자 정보 설정 (이름, 색상 등)
 */
function handleAwarenessMessage(workspaceId, connectionId, message) {
  const { event, data } = message;

  switch (event) {
    // 커서 이동 이벤트
    case 'cursor:move':
      awarenessManager.setCursor(connectionId, workspaceId, {
        x: data.x,  // 캔버스 X 좌표
        y: data.y,  // 캔버스 Y 좌표
      });
      break;

    // 임시 채팅 메시지 입력 (Figma처럼 "/" 키로 활성화)
    case 'chat:temp':
      awarenessManager.setTempChat(connectionId, workspaceId, {
        message: data.message,      // 채팅 내용
        position: data.position,    // 채팅 표시 위치 {x, y}
        timestamp: new Date().toISOString(),
      });
      break;

    // 임시 채팅 제거 (ESC 키나 전송 후)
    case 'chat:clear':
      awarenessManager.clearTempChat(connectionId, workspaceId);
      break;

    // 사용자 정보 설정 (최초 접속 시)
    case 'user:info':
      awarenessManager.setUser(connectionId, workspaceId, {
        id: data.userId,
        name: data.userName,
        email: data.userEmail,
        color: data.userColor,  // 커서 색상
      });
      break;

    // 알 수 없는 이벤트 타입
    default:
      logger.warn(`Unknown awareness event: ${event}`);
  }
}

/**
 * ============================================
 * 서버 초기화 및 시작
 * ============================================
 *
 * 실행 순서:
 * 1. MongoDB 연결
 * 2. Kafka producer 초기화
 * 3. 배치 전송 스케줄러 시작 (5초마다)
 * 4. HTTP/WebSocket 서버 시작
 * 5. Graceful shutdown 핸들러 등록
 */
async function startServer() {
  try {
    // 1. MongoDB 연결 (초기 데이터 로드를 위해)
    await mongodb.connect();

    // 2. Kafka producer 초기화 (환경변수에 따라 실제 연결 또는 stub mode)
    await kafkaProducer.initialize();

    // 3. 배치 전송 스케줄러 시작 (5초마다 자동으로 변경사항 전송)
    kafkaProducer.startBatchScheduler();

    // 3. HTTP/WebSocket 서버 시작
    server.listen(PORT, () => {
      logger.info(`🚀 Mindmap WebSocket Server running on port ${PORT}`);
      logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws?workspace=<workspace_id>`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Stats: http://localhost:${PORT}/stats`);
      logger.info('');
      logger.info('Environment:');
      logger.info(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  - LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
      logger.info(`  - YDOC_GC_ENABLED: ${process.env.YDOC_GC_ENABLED || 'false'}`);
      logger.info(`  - MongoDB: ${mongodb.isHealthy() ? 'connected' : 'disconnected'}`);
      logger.info(`  - Kafka: ${kafkaProducer.isEnabled ? 'enabled' : 'stub mode'}`);
    });

    /**
     * ============================================
     * Graceful Shutdown 핸들러
     * ============================================
     *
     * 서버 종료 시 안전하게 종료하기 위한 처리
     * SIGTERM, SIGINT 시그널 수신 시 실행 (Ctrl+C, Docker stop 등)
     *
     * 종료 순서:
     * 1. 남은 모든 변경사항을 Kafka로 전송 (데이터 손실 방지)
     * 2. Kafka 연결 종료
     * 3. MongoDB 연결 종료
     * 4. HTTP/WebSocket 서버 종료
     * 5. 프로세스 종료
     */
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      // 1. 모든 워크스페이스의 대기중인 변경사항 즉시 전송
      const workspaces = ydocManager.getWorkspacesWithChanges();
      for (const workspaceId of workspaces) {
        await kafkaProducer.sendImmediately(workspaceId);
      }

      // 2. Kafka producer 연결 종료
      await kafkaProducer.disconnect();

      // 3. MongoDB 연결 종료
      await mongodb.disconnect();

      // 4. HTTP/WebSocket 서버 종료
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);  // 정상 종료
      });

      // 4. 10초 안에 종료되지 않으면 강제 종료 (무한 대기 방지)
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);  // 강제 종료 (에러 코드)
      }, 10000);
    };

    // SIGTERM 시그널 핸들러 등록 (Docker, Kubernetes에서 컨테이너 종료 시)
    process.on('SIGTERM', shutdown);

    // SIGINT 시그널 핸들러 등록 (Ctrl+C로 종료 시)
    process.on('SIGINT', shutdown);

  } catch (error) {
    // 서버 시작 실패 시 에러 로그 출력 및 프로세스 종료
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// ===== 서버 시작 =====
startServer();
