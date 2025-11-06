/**
 * Awareness Manager - 사용자 인식 관리자
 *
 * Awareness란?
 * - 다른 사용자의 실시간 상태를 공유하는 시스템
 * - 문서 내용(Y.Doc)과는 별개로, "누가 어디를 보고 있는지" 같은 임시 정보를 공유
 * - 연결이 끊기면 자동으로 사라지는 휘발성 데이터 (영구 저장 X)
 *
 * 주요 기능:
 * 1. cursor:move - 실시간 커서 위치 공유 (Google Docs처럼 다른 사용자 커서 표시)
 * 2. chat:temp - 임시 채팅 (Figma처럼 "/" 키를 누르면 채팅 입력)
 * 3. user:info - 사용자 정보 공유 (이름, 이메일, 색상 등)
 */

import { Awareness } from 'y-protocols/awareness';
import { logger } from '../utils/logger.js';

class AwarenessManager {
  constructor() {
    // 워크스페이스ID -> Awareness 인스턴스 매핑
    // 각 워크스페이스마다 독립적인 Awareness 관리
    this.awarenessInstances = new Map();
    logger.info('AwarenessManager initialized');
  }

  /**
   * 워크스페이스의 Awareness 인스턴스 가져오기 또는 생성
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {Y.Doc} ydoc - Y.js 문서 객체
   * @returns {Awareness} Awareness 인스턴스
   */
  getAwareness(workspaceId, ydoc) {
    if (!this.awarenessInstances.has(workspaceId)) {
      logger.info(`Creating new Awareness for workspace ${workspaceId}`);
      const awareness = new Awareness(ydoc);  // Y.Doc과 연결된 Awareness 생성

      // Awareness 변경 감지 이벤트 리스너 등록
      // 누군가 커서를 움직이거나, 채팅을 입력하면 실행됨
      awareness.on('change', ({ added, updated, removed }) => {
        this.handleAwarenessChange(workspaceId, { added, updated, removed }, awareness);
      });

      this.awarenessInstances.set(workspaceId, awareness);
    }

    return this.awarenessInstances.get(workspaceId);
  }

  /**
   * Awareness 변경사항 처리 (커서 이동, 채팅, 사용자 정보 등)
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {object} changes - 변경된 클라이언트 ID 목록 {added, updated, removed}
   * @param {Awareness} awareness - Awareness 인스턴스
   */
  handleAwarenessChange(workspaceId, { added, updated, removed }, awareness) {
    // 추가, 업데이트, 제거된 모든 클라이언트 ID를 하나의 배열로 합침
    const changes = [...added, ...updated, ...removed];

    changes.forEach((clientId) => {
      // 해당 클라이언트의 현재 상태 가져오기
      const clientState = awareness.getStates().get(clientId);

      if (clientState) {
        // 커서 위치가 변경된 경우 로그 출력
        if (clientState.cursor) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} cursor:`, {
            x: clientState.cursor.x,  // 캔버스 X 좌표
            y: clientState.cursor.y,  // 캔버스 Y 좌표
          });
        }

        // 임시 채팅 메시지가 있는 경우 로그 출력
        if (clientState.tempChat) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} chat:`, {
            message: clientState.tempChat.message,      // 채팅 내용
            position: clientState.tempChat.position,    // 채팅이 표시될 위치
          });
        }

        // 사용자 정보가 업데이트된 경우 로그 출력
        if (clientState.user) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} user:`, {
            name: clientState.user.name,    // 사용자 이름
            color: clientState.user.color,  // 커서/하이라이트 색상
          });
        }
      }
    });

    // 연결 해제된 클라이언트가 있으면 로그 출력
    if (removed.length > 0) {
      logger.info(`Workspace ${workspaceId} - ${removed.length} client(s) disconnected`);
    }
  }

  /**
   * 클라이언트의 커서 위치 설정
   * @param {number} clientId - 클라이언트 ID
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {object} cursor - 커서 좌표 { x, y }
   */
  setCursor(clientId, workspaceId, cursor) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      // Awareness의 'cursor' 필드 업데이트 -> 다른 클라이언트들에게 자동 전파됨
      awareness.setLocalStateField('cursor', cursor);
      logger.debug(`Client ${clientId} cursor updated in workspace ${workspaceId}`, cursor);
    }
  }

  /**
   * 임시 채팅 메시지 설정 (Figma처럼 "/" 키를 누르면 활성화)
   * @param {number} clientId - 클라이언트 ID
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {object} tempChat - 채팅 데이터 { message, position: {x, y}, timestamp }
   */
  setTempChat(clientId, workspaceId, tempChat) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      // 'tempChat' 필드 설정 -> 다른 사용자들에게 말풍선으로 표시됨
      awareness.setLocalStateField('tempChat', tempChat);
      logger.debug(`Client ${clientId} temp chat in workspace ${workspaceId}`, tempChat);
    }
  }

  /**
   * 임시 채팅 메시지 제거 (ESC 키나 전송 후)
   * @param {number} clientId - 클라이언트 ID
   * @param {string|number} workspaceId - 워크스페이스 ID
   */
  clearTempChat(clientId, workspaceId) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      // tempChat을 null로 설정하여 제거
      awareness.setLocalStateField('tempChat', null);
    }
  }

  /**
   * 사용자 정보 설정 (접속 시 프로필 전송)
   * @param {number} clientId - 클라이언트 ID
   * @param {string|number} workspaceId - 워크스페이스 ID
   * @param {object} user - 사용자 정보 { id, name, email, color }
   */
  setUser(clientId, workspaceId, user) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      // 'user' 필드 설정 -> 다른 사용자들에게 "누가 접속했는지" 표시됨
      awareness.setLocalStateField('user', user);
      logger.info(`Client ${clientId} user info set in workspace ${workspaceId}`, {
        userId: user.id,
        name: user.name,
      });
    }
  }

  /**
   * Get all connected clients in a workspace
   * @param {string|number} workspaceId
   * @returns {Array}
   */
  getConnectedClients(workspaceId) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (!awareness) return [];

    const clients = [];
    awareness.getStates().forEach((state, clientId) => {
      clients.push({
        clientId,
        user: state.user,
        cursor: state.cursor,
        tempChat: state.tempChat,
      });
    });

    return clients;
  }

  /**
   * Remove client from awareness
   * @param {number} clientId
   * @param {string|number} workspaceId
   */
  removeClient(clientId, workspaceId) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      awareness.setLocalState(null);
      logger.info(`Client ${clientId} removed from workspace ${workspaceId}`);
    }
  }

  /**
   * Destroy awareness instance for a workspace
   * @param {string|number} workspaceId
   */
  destroyAwareness(workspaceId) {
    if (this.awarenessInstances.has(workspaceId)) {
      const awareness = this.awarenessInstances.get(workspaceId);
      awareness.destroy();
      this.awarenessInstances.delete(workspaceId);
      logger.info(`Destroyed Awareness for workspace ${workspaceId}`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalWorkspaces: this.awarenessInstances.size,
      workspaces: [],
    };

    for (const [workspaceId, awareness] of this.awarenessInstances.entries()) {
      stats.workspaces.push({
        workspaceId,
        connectedClients: awareness.getStates().size,
      });
    }

    return stats;
  }
}

// Export singleton instance
export const awarenessManager = new AwarenessManager();
