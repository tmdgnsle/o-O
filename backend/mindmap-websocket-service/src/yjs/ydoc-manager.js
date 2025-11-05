/**
 * Y.Doc Manager - Manages Y.js documents per workspace
 * Each workspace has its own Y.Doc instance for real-time collaboration
 */

import * as Y from 'yjs';
import { logger } from '../utils/logger.js';

class YDocManager {
  constructor() {
    // Map<workspaceId, Y.Doc>
    this.docs = new Map();

    // Map<workspaceId, Set<changeCallback>>
    this.changeListeners = new Map();

    // Map<workspaceId, Array<changeEvent>>
    this.pendingChanges = new Map();

    logger.info('YDocManager initialized');
  }

  /**
   * Get or create a Y.Doc for a workspace
   * @param {string|number} workspaceId
   * @returns {Y.Doc}
   */
  getDoc(workspaceId) {
    if (!this.docs.has(workspaceId)) {
      logger.info(`Creating new Y.Doc for workspace ${workspaceId}`);
      const ydoc = new Y.Doc();

      // Enable garbage collection (optional)
      if (process.env.YDOC_GC_ENABLED === 'true') {
        ydoc.gc = true;
      }

      // Set up change observer
      this.setupChangeObserver(workspaceId, ydoc);

      this.docs.set(workspaceId, ydoc);
      this.pendingChanges.set(workspaceId, []);
    }

    return this.docs.get(workspaceId);
  }

  /**
   * Setup change observer for a Y.Doc
   * Tracks all changes to nodes (add, update, delete)
   */
  setupChangeObserver(workspaceId, ydoc) {
    const nodesMap = ydoc.getMap('nodes');

    nodesMap.observe((event) => {
      const changes = [];

      // Handle added/updated nodes
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const nodeData = nodesMap.get(key);
          changes.push({
            operation: change.action === 'add' ? 'ADD' : 'UPDATE',
            nodeId: key,
            workspaceId: workspaceId,
            ...nodeData,
            timestamp: new Date().toISOString(),
          });
        } else if (change.action === 'delete') {
          changes.push({
            operation: 'DELETE',
            nodeId: key,
            workspaceId: workspaceId,
            timestamp: new Date().toISOString(),
          });
        }
      });

      if (changes.length > 0) {
        this.addPendingChanges(workspaceId, changes);
        logger.debug(`Detected ${changes.length} changes in workspace ${workspaceId}`);
      }
    });
  }

  /**
   * Add pending changes to be sent to Kafka
   */
  addPendingChanges(workspaceId, changes) {
    if (!this.pendingChanges.has(workspaceId)) {
      this.pendingChanges.set(workspaceId, []);
    }

    const pending = this.pendingChanges.get(workspaceId);
    pending.push(...changes);
  }

  /**
   * Get and clear pending changes for a workspace
   * Used by Kafka producer to batch send changes
   */
  flushPendingChanges(workspaceId) {
    const changes = this.pendingChanges.get(workspaceId) || [];
    this.pendingChanges.set(workspaceId, []);
    return changes;
  }

  /**
   * Get all workspaces with pending changes
   */
  getWorkspacesWithChanges() {
    const workspaces = [];
    for (const [workspaceId, changes] of this.pendingChanges.entries()) {
      if (changes.length > 0) {
        workspaces.push(workspaceId);
      }
    }
    return workspaces;
  }

  /**
   * Initialize Y.Doc with existing nodes from MongoDB
   * Called when first client connects to a workspace
   */
  initializeDoc(workspaceId, nodes) {
    const ydoc = this.getDoc(workspaceId);
    const nodesMap = ydoc.getMap('nodes');

    // Temporarily disable observation to avoid triggering change events
    const isObserving = nodesMap.observers.size > 0;

    ydoc.transact(() => {
      nodes.forEach((node) => {
        nodesMap.set(node.nodeId.toString(), {
          parentId: node.parentId,
          type: node.type,
          keyword: node.keyword,
          memo: node.memo,
          contentUrl: node.contentUrl,
          x: node.x,
          y: node.y,
          color: node.color,
          createdBy: node.createdBy,
        });
      });
    });

    logger.info(`Initialized workspace ${workspaceId} with ${nodes.length} nodes`);
  }

  /**
   * Get connection count for a workspace
   */
  getConnectionCount(workspaceId) {
    // This will be implemented when we integrate with y-websocket
    // For now, return 0
    return 0;
  }

  /**
   * Destroy a Y.Doc when no clients are connected
   */
  destroyDoc(workspaceId) {
    if (this.docs.has(workspaceId)) {
      const ydoc = this.docs.get(workspaceId);
      ydoc.destroy();
      this.docs.delete(workspaceId);
      this.pendingChanges.delete(workspaceId);
      this.changeListeners.delete(workspaceId);
      logger.info(`Destroyed Y.Doc for workspace ${workspaceId}`);
    }
  }

  /**
   * Get statistics about current Y.Docs
   */
  getStats() {
    const stats = {
      totalDocs: this.docs.size,
      workspaces: [],
    };

    for (const [workspaceId, ydoc] of this.docs.entries()) {
      const nodesMap = ydoc.getMap('nodes');
      stats.workspaces.push({
        workspaceId,
        nodeCount: nodesMap.size,
        pendingChanges: this.pendingChanges.get(workspaceId)?.length || 0,
      });
    }

    return stats;
  }
}

// Export singleton instance
export const ydocManager = new YDocManager();
