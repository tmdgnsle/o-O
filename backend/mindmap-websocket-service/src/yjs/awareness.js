/**
 * Awareness Manager - Handles cursor positions and temporary chat
 *
 * Features:
 * 1. cursor:move - Real-time cursor position sharing
 * 2. chat:temp - Temporary chat when user types "/" (Figma-like)
 */

import { Awareness } from 'y-protocols/awareness';
import { logger } from '../utils/logger.js';

class AwarenessManager {
  constructor() {
    // Map<workspaceId, Awareness>
    this.awarenessInstances = new Map();
    logger.info('AwarenessManager initialized');
  }

  /**
   * Get or create Awareness instance for a workspace
   * @param {string|number} workspaceId
   * @param {Y.Doc} ydoc
   * @returns {Awareness}
   */
  getAwareness(workspaceId, ydoc) {
    if (!this.awarenessInstances.has(workspaceId)) {
      logger.info(`Creating new Awareness for workspace ${workspaceId}`);
      const awareness = new Awareness(ydoc);

      // Setup awareness change listener
      awareness.on('change', ({ added, updated, removed }) => {
        this.handleAwarenessChange(workspaceId, { added, updated, removed }, awareness);
      });

      this.awarenessInstances.set(workspaceId, awareness);
    }

    return this.awarenessInstances.get(workspaceId);
  }

  /**
   * Handle awareness changes (cursor, chat, etc.)
   */
  handleAwarenessChange(workspaceId, { added, updated, removed }, awareness) {
    const changes = [...added, ...updated, ...removed];

    changes.forEach((clientId) => {
      const clientState = awareness.getStates().get(clientId);

      if (clientState) {
        // Log cursor movement
        if (clientState.cursor) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} cursor:`, {
            x: clientState.cursor.x,
            y: clientState.cursor.y,
          });
        }

        // Log temporary chat
        if (clientState.tempChat) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} chat:`, {
            message: clientState.tempChat.message,
            position: clientState.tempChat.position,
          });
        }

        // Log user info
        if (clientState.user) {
          logger.debug(`Workspace ${workspaceId} - Client ${clientId} user:`, {
            name: clientState.user.name,
            color: clientState.user.color,
          });
        }
      }
    });

    if (removed.length > 0) {
      logger.info(`Workspace ${workspaceId} - ${removed.length} client(s) disconnected`);
    }
  }

  /**
   * Set client cursor position
   * @param {number} clientId
   * @param {string|number} workspaceId
   * @param {object} cursor - { x, y }
   */
  setCursor(clientId, workspaceId, cursor) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      const currentState = awareness.getLocalState() || {};
      awareness.setLocalStateField('cursor', cursor);
      logger.debug(`Client ${clientId} cursor updated in workspace ${workspaceId}`, cursor);
    }
  }

  /**
   * Set temporary chat message (triggered by "/" key)
   * @param {number} clientId
   * @param {string|number} workspaceId
   * @param {object} tempChat - { message, position: {x, y}, timestamp }
   */
  setTempChat(clientId, workspaceId, tempChat) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      awareness.setLocalStateField('tempChat', tempChat);
      logger.debug(`Client ${clientId} temp chat in workspace ${workspaceId}`, tempChat);
    }
  }

  /**
   * Clear temporary chat
   * @param {number} clientId
   * @param {string|number} workspaceId
   */
  clearTempChat(clientId, workspaceId) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
      awareness.setLocalStateField('tempChat', null);
    }
  }

  /**
   * Set user information
   * @param {number} clientId
   * @param {string|number} workspaceId
   * @param {object} user - { id, name, email, color }
   */
  setUser(clientId, workspaceId, user) {
    const awareness = this.awarenessInstances.get(workspaceId);
    if (awareness) {
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
