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
 * - 직접 연결: ws://localhost:3000/mindmap/ws?workspace=123
 * - Gateway 경유: ws://gateway:8080/mindmap/ws?workspace=123&token=xxx
 *   (Gateway가 JWT 검증 후 X-Workspace-ID, X-USER-ID 헤더로 전달)
 */

import 'dotenv/config';  // .env 파일에서 환경변수 로드
import express from 'express';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';  // Y.js WebSocket 유틸
import * as Y from 'yjs';
import http from 'http';
import { logger } from './utils/logger.js';
import { ydocManager } from './yjs/ydoc-manager.js';
import { awarenessManager } from './yjs/awareness.js';
import { kafkaProducer } from './kafka/producer.js';
import { kafkaConsumer } from './kafka/consumer.js';
import { signalingManager } from './webrtc/signaling-manager.js';

const app = express();
const PORT = process.env.PORT || 8084;  // 기본 포트 8084

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
      kafka: {
        producer: kafkaProducer.getStatus(),   // Kafka Producer 상태
        consumer: kafkaConsumer.getStatus(),   // Kafka Consumer 상태
      },
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
    voiceChat: signalingManager.getStats(),
    kafka: {
      producer: kafkaProducer.getStatus(),
      consumer: kafkaConsumer.getStatus(),
    },
  });
});

// ===== WebSocket 서버 설정 =====

// HTTP 서버 생성 (Express 앱을 기반으로)
const server = http.createServer(app);

// WebSocket 서버 생성 (HTTP 서버에 연결)
// path를 제거하고 noServer: false로 설정하여 모든 경로 허용
// 대신 connection 핸들러에서 URL 검증 수행
const wss = new WebSocketServer({
  server,       // HTTP 서버에 WebSocket 서버 연결
  // path를 지정하지 않으면 모든 WebSocket 요청을 받음
  // y-websocket이 만드는 /mindmap/ws/{roomId} 형태도 처리 가능
});

logger.info('WebSocket server created (accepts /mindmap/ws for Y.js sync and /mindmap/voice for voice chat)');

/**
 * ============================================
 * WebSocket 연결 핸들러 (핵심 로직)
 * ============================================
 *
 * 클라이언트가 WebSocket으로 접속할 때마다 실행됨
 * URL 형식:
 * - Y.js 동기화: ws://localhost:8084/mindmap/ws?workspace=123
 * - 음성 채팅: ws://localhost:8084/mindmap/voice?workspace=123
 * - Gateway: ws://gateway:8080/mindmap/{ws|voice}?workspace=123&token=xxx
 *
 * 처리 흐름:
 * 1. URL 경로에 따라 라우팅 (Y.js vs 음성 채팅)
 * 2. workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback) 및 검증
 * 3. user ID 추출 (Gateway에서 JWT 검증 후 헤더로 전달)
 * 4-1. /mindmap/ws: Y.Doc, Awareness 인스턴스 가져오기 (없으면 생성)
 * 4-2. /mindmap/voice: SignalingManager로 음성 채팅 처리
 * 5. 이벤트 리스너 등록 (close, error, message)
 */
wss.on('connection', (conn, req) => {
  // URL에서 쿼리 파라미터 파싱
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 경로에 따라 라우팅: /mindmap/voice → 음성 채팅, /mindmap/ws → Y.js 동기화
  if (pathname.startsWith('/mindmap/voice')) {
    handleVoiceConnection(conn, req, url);
    return;
  }

  // 기본: Y.js 연결 처리
  handleYjsConnection(conn, req, url);
});

/**
 * ============================================
 * 음성 채팅 WebSocket 연결 핸들러
 * ============================================
 */
function handleVoiceConnection(conn, req, url) {
  // workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback)
  const workspaceId = req.headers['x-workspace-id'] || url.searchParams.get('workspace');

  // user ID 추출 (Gateway의 JWT 검증 결과)
  const userId = req.headers['x-user-id'] || url.searchParams.get('userId');

  // workspace ID가 없으면 연결 거부
  if (!workspaceId) {
    logger.warn('[VoiceChat] Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');
    return;
  }

  // user ID가 없으면 연결 거부
  if (!userId) {
    logger.warn('[VoiceChat] Connection rejected: missing user ID');
    conn.close(1008, 'Missing user ID');
    return;
  }

  logger.info(`[VoiceChat] New connection to workspace ${workspaceId}`, {
    userId,
    source: req.headers['x-workspace-id'] ? 'gateway-header' : 'query-param'
  });

  // 음성 채팅 방에 참가
  const joined = signalingManager.joinVoice(workspaceId, userId, conn);
  if (!joined) {
    logger.warn(`[VoiceChat] Failed to join workspace ${workspaceId} for user ${userId}`);
    return;
  }

  // 메시지 핸들러 등록
  conn.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      logger.debug(`[VoiceChat] Message received from user ${userId}:`, message.type);

      switch (message.type) {
        case 'offer':
          signalingManager.handleOffer(workspaceId, userId, message.toUserId, message.offer);
          break;

        case 'answer':
          signalingManager.handleAnswer(workspaceId, userId, message.toUserId, message.answer);
          break;

        case 'ice':
          signalingManager.handleIceCandidate(workspaceId, userId, message.toUserId, message.candidate);
          break;

        case 'voice-state':
          signalingManager.handleVoiceState(workspaceId, userId, message.voiceState);
          break;

        default:
          logger.warn(`[VoiceChat] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error(`[VoiceChat] Error handling message from user ${userId}:`, error.message);
    }
  });

  // 연결 종료 핸들러
  conn.on('close', () => {
    logger.info(`[VoiceChat] Connection closed for workspace ${workspaceId}, user ${userId}`);
    signalingManager.leaveVoice(workspaceId, userId);
  });

  // 에러 핸들러
  conn.on('error', (error) => {
    logger.error(`[VoiceChat] WebSocket error for user ${userId}:`, error.message);
  });
}

/**
 * ============================================
 * Y.js 동기화 WebSocket 연결 핸들러
 * ============================================
 */
function handleYjsConnection(conn, req, url) {
  // workspace ID 추출 (헤더 우선, 쿼리 파라미터 fallback)
  // Gateway를 통해 들어오면 X-Workspace-ID 헤더로 전달됨
  const workspaceId = req.headers['x-workspace-id'] || url.searchParams.get('workspace');

  // user ID 추출 (Gateway의 JWT 검증 결과)
  const userId = req.headers['x-user-id'];

  // workspace ID가 없으면 연결 거부
  if (!workspaceId) {
    logger.warn('Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');  // WebSocket 연결 종료 (오류 코드 1008)
    return;
  }

  logger.info(`New connection to workspace ${workspaceId}`, {
    userId: userId || 'anonymous',
    source: req.headers['x-workspace-id'] ? 'gateway-header' : 'query-param'
  });

  // 해당 워크스페이스의 Y.Doc 가져오기 또는 생성
  // Y.Doc: 실제 마인드맵 데이터를 저장하는 CRDT 문서
  // 클라이언트가 이미 HTTP로 초기 데이터를 로드한 상태에서 연결함
  const ydoc = ydocManager.getDoc(workspaceId);

  // 해당 워크스페이스의 Awareness 가져오기 또는 생성
  // Awareness: 커서 위치, 사용자 정보 등 임시 상태 공유
  const awareness = awarenessManager.getAwareness(workspaceId, ydoc);

  // Y.js WebSocket 연결 설정 (y-websocket 라이브러리 유틸 사용)
  // 이 함수가 Y.js 프로토콜을 처리해줌 (동기화, 업데이트 전파 등)
  // awareness를 주입하면 클라이언트 간 커서/채팅 자동 동기화됨
  setupWSConnection(conn, req, {
    docName: `workspace-${workspaceId}`,           // 문서 이름
    gc: process.env.YDOC_GC_ENABLED === 'true',    // 가비지 컬렉션 활성화 여부
  }, ydoc, awareness);  // ydoc과 awareness 명시적으로 전달

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

    // 메모리 누수 방지: 해당 workspace에 연결된 클라이언트가 0명이면 메모리 정리
    // Awareness에서 현재 접속 중인 클라이언트 수 확인
    const connectedClients = awarenessManager.getConnectedClients(workspaceId);
    if (connectedClients.length === 0) {
      logger.info(`No clients left in workspace ${workspaceId}, cleaning up memory`);

      // Y.Doc 및 Awareness 인스턴스 삭제 (메모리 해제)
      ydocManager.destroyDoc(workspaceId);
      awarenessManager.destroyAwareness(workspaceId);

      logger.info(`Memory cleanup completed for workspace ${workspaceId}`);
    } else {
      logger.debug(`Workspace ${workspaceId} still has ${connectedClients.length} connected client(s)`);
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

  // NOTE: 커스텀 메시지 핸들러 제거됨
  // Yjs의 setupWSConnection이 awareness를 주입받아서 자동으로 처리하므로
  // 클라이언트의 awareness.setLocalStateField() 호출이 자동으로 동기화됨
  // 서버에서는 awareness.on('change') 이벤트로 변경사항을 감지할 수 있음 (awareness.js 참고)
}

/**
 * ============================================
 * 서버 초기화 및 시작
 * ============================================
 *
 *
 * 실행 순서:
 * 1. Kafka producer 초기화
 * 2. Kafka consumer 초기화 및 시작
 * 3. 배치 전송 스케줄러 시작 (5초마다)
 * 4. HTTP/WebSocket 서버 시작
 * 5. Graceful shutdown 핸들러 등록
 */
async function startServer() {
  try {
    // 1. Kafka producer 초기화 (환경변수에 따라 실제 연결 또는 stub mode)
    await kafkaProducer.initialize();

    // 2. Kafka consumer 초기화 및 시작 (AI 업데이트 수신용)
    await kafkaConsumer.initialize();
    await kafkaConsumer.start();

    // 3. 배치 전송 스케줄러 시작 (5초마다 자동으로 변경사항 전송)
    kafkaProducer.startBatchScheduler();

    // 4. HTTP/WebSocket 서버 시작
    server.listen(PORT, () => {
      logger.info(`🚀 Mindmap WebSocket Server running on port ${PORT}`);
      logger.info(`Y.js sync endpoint: ws://localhost:${PORT}/mindmap/ws?workspace=<workspace_id>`);
      logger.info(`Voice chat endpoint: ws://localhost:${PORT}/mindmap/voice?workspace=<workspace_id>&userId=<user_id>`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Stats: http://localhost:${PORT}/stats`);
      logger.info('');
      logger.info('Environment:');
      logger.info(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  - LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
      logger.info(`  - YDOC_GC_ENABLED: ${process.env.YDOC_GC_ENABLED || 'false'}`);
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

      // 2. 음성 채팅 방 정리
      signalingManager.cleanup();

      // 3. Kafka consumer 연결 종료
      await kafkaConsumer.disconnect();

      // 4. Kafka producer 연결 종료
      await kafkaProducer.disconnect();

      // 5. HTTP/WebSocket 서버 종료
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);  // 정상 종료
      });

      // 10초 안에 종료되지 않으면 강제 종료 (무한 대기 방지)
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
