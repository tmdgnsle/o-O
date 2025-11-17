/**
 * Kafka Consumer Service - AI 분석 완료 알림 수신
 *
 * 왜 필요한가?
 * - Spring Mindmap Service가 RunPod에서 AI 분석을 완료하면
 * - Kafka 토픽(mindmap.node.update)으로 결과를 발행
 * - Node.js가 이를 수신하여 Y.Doc에 업데이트
 * - 모든 연결된 클라이언트에게 실시간 전파
 *
 * 플로우:
 * 1. 이미지/영상 노드 추가 → Y.js 동기화
 * 2. Kafka (mindmap.node.events) → Spring
 * 3. Spring → RunPod AI 분석 요청
 * 4. AI 완료 → Spring → Kafka (mindmap.node.update)
 * 5. Node.js Consumer 수신 → Y.Doc 업데이트
 * 6. 모든 클라이언트 자동 동기화
 */

import { Kafka } from 'kafkajs';
import { logger } from '../utils/logger.js';
import { ydocManager } from '../yjs/ydoc-manager.js';

class KafkaConsumerService {
  constructor() {
    this.kafka = null;          // Kafka 클라이언트 인스턴스
    this.consumer = null;        // Kafka Consumer 인스턴스
    this.isEnabled = false;      // Kafka 사용 여부 (환경변수로 제어)
    this.isConnected = false;    // Kafka 연결 상태
    this.onInitialCreateDone = null;  // 초기 노드 생성 완료 이벤트 핸들러
  }

  /**
   * 초기 노드 생성 완료 이벤트 핸들러 등록
   * @param {function} handler - workspaceId를 받는 콜백 함수
   */
  setInitialCreateDoneHandler(handler) {
    this.onInitialCreateDone = handler;
    logger.info('Initial create done handler registered');
  }

  /**
   * Kafka Consumer 초기화 및 연결
   * 환경변수 KAFKA_BROKERS가 설정되어 있으면 실제 Kafka에 연결
   * 없으면 비활성화 (stub mode)
   */
  async initialize() {
    try {
      const brokers = process.env.KAFKA_BROKERS;  // 예: "localhost:9092,localhost:9093"

      // Kafka 브로커 주소가 없으면 비활성화
      if (!brokers) {
        logger.warn('KAFKA_BROKERS not set. Kafka consumer disabled');
        this.isEnabled = false;
        return;
      }

      // Kafka 클라이언트 생성
      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'mindmap-websocket-service',  // 클라이언트 식별자
        brokers: brokers.split(','),  // 쉼표로 구분된 브로커 주소 배열로 변환
      });

      // Consumer 인스턴스 생성
      this.consumer = this.kafka.consumer({
        groupId: process.env.KAFKA_CONSUMER_GROUP || 'mindmap-websocket-consumer',
      });

      // Kafka 브로커에 연결 시도
      await this.consumer.connect();
      this.isConnected = true;
      this.isEnabled = true;

      // mindmap.node.update 토픽 구독
      const topic = process.env.KAFKA_TOPIC_NODE_UPDATE || 'mindmap.node.update';
      await this.consumer.subscribe({
        topic,
        fromBeginning: false  // 새로운 메시지만 수신 (과거 이력 무시)
      });

      logger.info(`Kafka consumer subscribed to ${topic}`, { brokers });
    } catch (error) {
      // 연결 실패 시 비활성화 (서비스 중단 방지)
      logger.error('Failed to initialize Kafka consumer', {
        error: error.message,
        stack: error.stack,
      });
      this.isEnabled = false;
    }
  }

  /**
   * Consumer 시작: 메시지 수신 대기
   * 메시지가 도착하면 eachMessage 콜백 실행
   */
  async start() {
    if (!this.consumer || !this.isConnected) {
      logger.debug('Kafka consumer not enabled, skipping start');
      return;
    }

    try {
      await this.consumer.run({
        // 각 메시지를 처리하는 콜백
        eachMessage: async ({ topic, partition, message }) => {
          try {
            // Kafka 메시지 파싱
            const data = JSON.parse(message.value.toString());

            logger.debug('Received Kafka message', {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
            });

            // 노드 업데이트 처리
            this.handleNodeUpdate(data);
          } catch (error) {
            logger.error('Failed to process Kafka message', {
              error: error.message,
              messageValue: message.value?.toString(),
            });
          }
        },
      });

      logger.info('Kafka consumer started and listening for messages');
    } catch (error) {
      logger.error('Failed to start Kafka consumer', {
        error: error.message,
      });
    }
  }

  /**
   * Spring이 보낸 노드 업데이트를 처리
   *
   * 메시지 형식 예시 (기존 방식 - nodeId, updates 포함):
   * {
   *   workspaceId: 123,
   *   nodeId: 'n5',
   *   updates: {
   *     aiSummary: '이미지 분석 결과: 회의실 사진...',
   *     analysisStatus: 'DONE',
   *     contentType: 'image',
   *     updatedAt: '2025-11-06T12:00:00Z'
   *   }
   * }
   *
   * 메시지 형식 예시 (초기 노드 생성 완료):
   * {
   *   message: '노드 분석 후 업데이트를 완료했습니다.',
   *   workspaceId: 197
   * }
   *
   * @param {object} data - Kafka 메시지 데이터
   */
  handleNodeUpdate(data) {
    const { workspaceId, nodeId, updates, message } = data;

    // 필수 필드 검증: workspaceId는 항상 필요
    if (!workspaceId) {
      logger.warn('Invalid node update message: missing workspaceId', { data });
      return;
    }

    // 초기 노드 생성 완료 메시지 처리 (message 필드가 있고 nodeId가 없는 경우)
    if (message && !nodeId) {
      logger.info(`Received initial create done message from Kafka`, {
        workspaceId,
        message,
      });

      // 등록된 핸들러 호출
      if (this.onInitialCreateDone) {
        this.onInitialCreateDone(workspaceId);
      } else {
        logger.warn('No initial create done handler registered');
      }
      return;
    }

    // 기존 노드 업데이트 로직 (nodeId와 updates가 있는 경우)
    if (!nodeId || !updates) {
      logger.warn('Invalid node update message: missing nodeId or updates', { data });
      return;
    }

    logger.info(`Received node update from Kafka`, {
      workspaceId,
      nodeId,
      updateFields: Object.keys(updates),
    });

    // Y.Doc 가져오기 (이미 메모리에 있는 경우만)
    const ydoc = ydocManager.docs.get(workspaceId.toString());

    if (!ydoc) {
      logger.debug(`Workspace ${workspaceId} not in memory, skipping update`);
      // 해당 워크스페이스에 접속한 클라이언트가 없으면 업데이트 불필요
      // 다음에 클라이언트가 접속하면 HTTP로 최신 데이터를 받아옴
      return;
    }

    try {
      // Y.Doc 업데이트 → 모든 연결된 클라이언트에게 자동 전파
      const nodesMap = ydoc.getMap('nodes');
      const currentNode = nodesMap.get(nodeId.toString());

      if (currentNode) {
        // 기존 노드 데이터와 업데이트 병합
        nodesMap.set(nodeId.toString(), {
          ...currentNode,
          ...updates
        });

        logger.info(`Successfully updated node ${nodeId} in workspace ${workspaceId}`, {
          updatedFields: Object.keys(updates),
        });
      } else {
        logger.warn(`Node ${nodeId} not found in Y.Doc for workspace ${workspaceId}`);
        // 노드가 없으면 새로 생성할 수도 있지만, 일단 경고만 출력
        // 클라이언트가 다시 접속하면 HTTP로 전체 데이터를 받아옴
      }
    } catch (error) {
      logger.error(`Failed to update Y.Doc for workspace ${workspaceId}`, {
        error: error.message,
        nodeId,
      });
    }
  }

  /**
   * Kafka consumer 연결 종료 (graceful shutdown)
   * 서버 종료 시 호출되어 안전하게 연결을 끊음
   */
  async disconnect() {
    if (this.consumer && this.isConnected) {
      try {
        await this.consumer.disconnect();
        this.isConnected = false;
        logger.info('Kafka consumer disconnected');
      } catch (error) {
        logger.error('Failed to disconnect Kafka consumer', {
          error: error.message,
        });
      }
    }
  }

  /**
   * Kafka Consumer 상태 정보 반환
   * /health, /stats 엔드포인트에서 사용
   */
  getStatus() {
    return {
      enabled: this.isEnabled,          // Kafka 사용 여부
      connected: this.isConnected,      // 연결 상태
      topic: process.env.KAFKA_TOPIC_NODE_UPDATE || 'mindmap.node.update',
      consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'mindmap-websocket-consumer',
    };
  }
}

// Export singleton instance
export const kafkaConsumer = new KafkaConsumerService();
