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
    // 이미 존재하는 문서가 없으면 새로 생성
    if (!this.docs.has(workspaceId)) {
      logger.info(`Creating new Y.Doc for workspace ${workspaceId}`);
      const ydoc = new Y.Doc();  // 새 Y.js 문서 생성

      // 가비지 컬렉션 활성화 (선택사항)
      // gc=true: 삭제된 데이터를 메모리에서 제거하여 메모리 절약
      // gc=false: 모든 히스토리 보관 (undo/redo 가능하지만 메모리 많이 사용)
      if (process.env.YDOC_GC_ENABLED === 'true') {
        ydoc.gc = true;
      }

      // 문서 변경 감지 설정 (노드 추가/수정/삭제 감지)
      this.setupChangeObserver(workspaceId, ydoc);

      // Map에 저장
      this.docs.set(workspaceId, ydoc);
      this.pendingChanges.set(workspaceId, []);  // 빈 변경사항 배열 초기화
    }

    return this.docs.get(workspaceId);
  }

  /**
   * Y.Doc의 변경사항을 감지하는 Observer 설정
   * 노드 추가/수정/삭제를 실시간으로 감지하여 Kafka로 전송할 준비
   */
  setupChangeObserver(workspaceId, ydoc) {
    // Y.Doc에서 'nodes'라는 이름의 Map 가져오기
    // Map 구조: { nodeId1: {data...}, nodeId2: {data...}, ... }
    const nodesMap = ydoc.getMap('nodes');

    // Map이 변경될 때마다 실행되는 콜백 등록
    nodesMap.observe((event) => {
      const changes = [];  // 이번에 발생한 모든 변경사항 저장

      // 변경된 키(nodeId)들을 순회
      event.changes.keys.forEach((change, key) => {
        // 노드가 추가되거나 수정된 경우
        if (change.action === 'add' || change.action === 'update') {
          const nodeData = nodesMap.get(key);  // 현재 노드 데이터 가져오기
          changes.push({
            operation: change.action === 'add' ? 'ADD' : 'UPDATE',  // 작업 타입
            nodeId: key,  // 노드 ID
            workspaceId: workspaceId,  // 워크스페이스 ID
            ...nodeData,  // 노드의 모든 데이터 (keyword, memo, x, y, color 등)
            timestamp: new Date().toISOString(),  // 변경 시각
          });
        }
        // 노드가 삭제된 경우
        else if (change.action === 'delete') {
          changes.push({
            operation: 'DELETE',
            nodeId: key,
            workspaceId: workspaceId,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // 변경사항이 있으면 pending 큐에 추가 (나중에 배치로 Kafka 전송)
      if (changes.length > 0) {
        this.addPendingChanges(workspaceId, changes);
        logger.debug(`Detected ${changes.length} changes in workspace ${workspaceId}`);
      }
    });
  }

  /**
   * Kafka로 전송 대기중인 변경사항 추가
   * 즉시 전송하지 않고 모아서 배치로 처리 (성능 최적화)
   */
  addPendingChanges(workspaceId, changes) {
    // 해당 워크스페이스의 pending 배열이 없으면 생성
    if (!this.pendingChanges.has(workspaceId)) {
      this.pendingChanges.set(workspaceId, []);
    }

    const pending = this.pendingChanges.get(workspaceId);
    pending.push(...changes);  // 배열에 변경사항들 추가
  }

  /**
   * 워크스페이스의 대기중인 변경사항을 가져오고 비우기
   * Kafka producer가 배치 전송할 때 호출 (5초마다)
   */
  flushPendingChanges(workspaceId) {
    const changes = this.pendingChanges.get(workspaceId) || [];
    this.pendingChanges.set(workspaceId, []);  // 비우기 (다음 배치를 위해)
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
    return workspaces;
  }

  /**
   * MongoDB에서 기존 노드 데이터를 불러와 Y.Doc 초기화
   * 첫 클라이언트가 워크스페이스에 접속할 때 호출
   * (서버 재시작 후에도 이전 데이터 복원)
   */
  initializeDoc(workspaceId, nodes) {
    const ydoc = this.getDoc(workspaceId);
    const nodesMap = ydoc.getMap('nodes');

    // transaction으로 묶어서 한 번에 처리
    // 이렇게 하면 observer가 각 노드마다 실행되지 않고 마지막에 한 번만 실행됨
    ydoc.transact(() => {
      nodes.forEach((node) => {
        // MongoDB의 노드 데이터를 Y.js Map에 추가
        nodesMap.set(node.nodeId.toString(), {
          parentId: node.parentId,      // 부모 노드 ID (트리 구조)
          type: node.type,                // 노드 타입 (root, branch, leaf 등)
          keyword: node.keyword,          // 노드의 키워드/제목
          memo: node.memo,                // 메모 내용
          contentUrl: node.contentUrl,    // 첨부 콘텐츠 URL
          x: node.x,                      // 캔버스 상의 X 좌표
          y: node.y,                      // 캔버스 상의 Y 좌표
          color: node.color,              // 노드 색상
          createdBy: node.createdBy,      // 생성자 ID
        });
      });
    });

    logger.info(`Initialized workspace ${workspaceId} with ${nodes.length} nodes`);
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
   * 다시 접속하면 MongoDB에서 불러와서 재생성
   */
  destroyDoc(workspaceId) {
    if (this.docs.has(workspaceId)) {
      const ydoc = this.docs.get(workspaceId);
      ydoc.destroy();  // Y.Doc 메모리 해제
      this.docs.delete(workspaceId);
      this.pendingChanges.delete(workspaceId);
      this.changeListeners.delete(workspaceId);
      logger.info(`Destroyed Y.Doc for workspace ${workspaceId}`);
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
      const nodesMap = ydoc.getMap('nodes');
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
