/**
 * Y.Doc Manager - Manages Y.js documents per workspace
 * 각 워크스페이스마다 독립적인 Y.js 문서를 관리하는 매니저
 *
 * Y.js란?
 * - CRDT(Conflict-free Replicated Data Type) 알고리즘 기반
 * - 여러 사용자가 동시에 편집해도 충돌 없이 자동으로 병합
 * - Google Docs, Figma 같은 실시간 협업 기능의 핵심 기술
 */

import * as Y from 'yjs';
import { logger } from '../utils/logger.js';

class YDocManager {
  constructor() {
    // 워크스페이스ID -> Y.Doc 매핑
    // 각 워크스페이스는 독립적인 마인드맵 문서를 가짐
    this.docs = new Map();

    // 워크스페이스ID -> 변경 감지 콜백 함수들
    // 문서가 변경될 때 실행할 함수들을 저장
    this.changeListeners = new Map();

    // 워크스페이스ID -> 아직 Kafka로 전송되지 않은 변경사항들
    // 배치 처리를 위해 임시 저장 (5초마다 또는 10개 이상 쌓이면 전송)
    this.pendingChanges = new Map();

    logger.info('YDocManager initialized');
  }

  /**
   * 워크스페이스의 Y.Doc을 가져오거나 새로 생성
   * @param {string|number} workspaceId - 워크스페이스 고유 ID
   * @returns {Y.Doc} Y.js 문서 객체
   */
  getDoc(workspaceId) {
    logger.debug(`[YDocManager] getDoc called for workspace ${workspaceId}`);

    // 이미 존재하는 문서가 없으면 새로 생성
    if (!this.docs.has(workspaceId)) {
      logger.info(`[YDocManager] Creating new Y.Doc for workspace ${workspaceId}`);
      const ydoc = new Y.Doc();  // 새 Y.js 문서 생성

      // 가비지 컬렉션 활성화 (선택사항)
      // gc=true: 삭제된 데이터를 메모리에서 제거하여 메모리 절약
      // gc=false: 모든 히스토리 보관 (undo/redo 가능하지만 메모리 많이 사용)
      if (process.env.YDOC_GC_ENABLED === 'true') {
        ydoc.gc = true;
        logger.debug(`[YDocManager] GC enabled for workspace ${workspaceId}`);
      }

      // 문서 변경 감지 설정 (노드 추가/수정/삭제 감지)
      this.setupChangeObserver(workspaceId, ydoc);

      ydoc.on('update', (update, origin) => {
          logger.info('[YDOC_UPDATE]', {
              workspaceId,
              updateSize: update.length,
              originType: typeof origin,
          });
      });

      // Map에 저장
      this.docs.set(workspaceId, ydoc);
      this.pendingChanges.set(workspaceId, []);  // 빈 변경사항 배열 초기화
      logger.info(`[YDocManager] Y.Doc created and stored for workspace ${workspaceId}`);
    } else {
      logger.debug(`[YDocManager] Returning existing Y.Doc for workspace ${workspaceId}`);
    }

    return this.docs.get(workspaceId);
  }

  /**
   * Y.Doc의 변경사항을 감지하는 Observer 설정
   * 노드 추가/수정/삭제를 실시간으로 감지하여 Kafka로 전송할 준비
   */
  setupChangeObserver(workspaceId, ydoc) {
    logger.debug(`[YDocManager] Setting up change observer for workspace ${workspaceId}`);

    // Y.Doc에서 'mindmap:nodes'라는 이름의 Map 가져오기
    // Map 구조: { nodeId1: {data...}, nodeId2: {data...}, ... }
    const nodesMap = ydoc.getMap('mindmap:nodes');

    // Map이 변경될 때마다 실행되는 콜백 등록
    nodesMap.observe((event) => {
      const changes = [];  // 이번에 발생한 모든 변경사항 저장

      // 변경된 키(nodeId)들을 순회
      event.changes.keys.forEach((change, key) => {
        // 노드가 추가되거나 수정된 경우
        if (change.action === 'add' || change.action === 'update') {
          const nodeData = nodesMap.get(key);  // 현재 노드 데이터 가져오기

            logger.info('[YDocManager] NODE_CHANGE_DETECTED', {
                workspaceId,
                nodeId: key,
                action: change.action,
                nodeData,                    // keyword, memo, x, y, color 등 전부
            });

          changes.push({
            operation: change.action === 'add' ? 'ADD' : 'UPDATE',  // 작업 타입
            nodeId: key,  // 노드 ID
            workspaceId: workspaceId,  // 워크스페이스 ID
            ...nodeData,  // 노드의 모든 데이터 (keyword, memo, x, y, color 등)
            timestamp: new Date().toISOString(),  // 변경 시각
          });
          logger.debug(`[YDocManager] ${change.action.toUpperCase()} detected: node ${key} in workspace ${workspaceId}`);
        }
        // 노드가 삭제된 경우
        else if (change.action === 'delete') {
          changes.push({
            operation: 'DELETE',
            nodeId: key,
            workspaceId: workspaceId,
            timestamp: new Date().toISOString(),
          });
          logger.debug(`[YDocManager] DELETE detected: node ${key} in workspace ${workspaceId}`);
        }
      });

      // 변경사항이 있으면 pending 큐에 추가 (나중에 배치로 Kafka 전송)
      if (changes.length > 0) {
        this.addPendingChanges(workspaceId, changes);
        logger.info(`[YDocManager] Detected ${changes.length} changes in workspace ${workspaceId}`);
      }
    });

    logger.debug(`[YDocManager] Change observer setup complete for workspace ${workspaceId}`);
  }

  /**
   * Kafka로 전송 대기중인 변경사항 추가
   * 즉시 전송하지 않고 모아서 배치로 처리 (성능 최적화)
   */
  addPendingChanges(workspaceId, changes) {
    logger.debug(`[YDocManager] Adding ${changes.length} pending changes for workspace ${workspaceId}`);

    // 해당 워크스페이스의 pending 배열이 없으면 생성
    if (!this.pendingChanges.has(workspaceId)) {
      this.pendingChanges.set(workspaceId, []);
      logger.debug(`[YDocManager] Created new pending changes array for workspace ${workspaceId}`);
    }

    const pending = this.pendingChanges.get(workspaceId);
    pending.push(...changes);  // 배열에 변경사항들 추가
    logger.info(`[YDocManager] Total pending changes for workspace ${workspaceId}: ${pending.length}`);

    // Threshold 체크: 10개 이상 쌓이면 즉시 전송
    // 동적 import로 순환 참조 방지
    import('../kafka/producer.js').then(({ kafkaProducer }) => {
      kafkaProducer.checkThreshold(workspaceId);
    }).catch(error => {
      logger.error('[YDocManager] Failed to check Kafka threshold', { error: error.message });
    });
  }

  /**
   * 워크스페이스의 대기중인 변경사항을 가져오고 비우기
   * Kafka producer가 배치 전송할 때 호출 (5초마다)
   */
  flushPendingChanges(workspaceId) {
    const changes = this.pendingChanges.get(workspaceId) || [];
    logger.debug(`[YDocManager] Flushing ${changes.length} pending changes for workspace ${workspaceId}`);
    this.pendingChanges.set(workspaceId, []);  // 비우기 (다음 배치를 위해)
    if (changes.length > 0) {
      logger.info(`[YDocManager] Flushed ${changes.length} changes for workspace ${workspaceId}`);
    }
    return changes;
  }

  /**
   * 전송 대기중인 변경사항이 있는 모든 워크스페이스 ID 가져오기
   * Kafka producer가 어떤 워크스페이스들을 처리해야 하는지 파악
   */
  getWorkspacesWithChanges() {
    const workspaces = [];
    for (const [workspaceId, changes] of this.pendingChanges.entries()) {
      if (changes.length > 0) {  // 변경사항이 1개 이상 있는 워크스페이스만
        workspaces.push(workspaceId);
      }
    }
    // 변경사항이 있을 때만 로그 출력
    if (workspaces.length > 0) {
      logger.debug(`[YDocManager] Found ${workspaces.length} workspaces with pending changes`);
    }
    return workspaces;
  }


  /**
   * 워크스페이스의 현재 연결 수 가져오기
   * TODO: y-websocket과 통합 후 구현 예정
   */
  getConnectionCount(workspaceId) {
    return 0;
  }

  /**
   * 클라이언트가 모두 연결 해제되면 Y.Doc 제거 (메모리 절약)
   * 다시 접속하면 클라이언트가 HTTP로 데이터 로드 후 재초기화
   */
  destroyDoc(workspaceId) {
    logger.debug(`[YDocManager] Attempting to destroy Y.Doc for workspace ${workspaceId}`);
    if (this.docs.has(workspaceId)) {
      const ydoc = this.docs.get(workspaceId);
      ydoc.destroy();  // Y.Doc 메모리 해제
      this.docs.delete(workspaceId);
      this.pendingChanges.delete(workspaceId);
      this.changeListeners.delete(workspaceId);
      logger.info(`[YDocManager] Destroyed Y.Doc for workspace ${workspaceId}`);
    } else {
      logger.debug(`[YDocManager] No Y.Doc found to destroy for workspace ${workspaceId}`);
    }
  }

  /**
   * 현재 관리중인 Y.Doc들의 통계 정보
   * /stats 엔드포인트에서 사용
   */
  getStats() {
    const stats = {
      totalDocs: this.docs.size,  // 현재 메모리에 있는 문서 수
      workspaces: [],
    };

    for (const [workspaceId, ydoc] of this.docs.entries()) {
      const nodesMap = ydoc.getMap('mindmap:nodes');
      stats.workspaces.push({
        workspaceId,
        nodeCount: nodesMap.size,  // 해당 워크스페이스의 노드 수
        pendingChanges: this.pendingChanges.get(workspaceId)?.length || 0,  // 전송 대기중인 변경사항 수
      });
    }

    return stats;
  }
}

// Export singleton instance
export const ydocManager = new YDocManager();
