/**
 * Kafka Producer - Sends mindmap node changes to Kafka
 *
 * Phase 1: Stub implementation (logs only)
 * Phase 2: Actual Kafka integration
 */

import { Kafka } from 'kafkajs';
import { logger } from '../utils/logger.js';
import { ydocManager } from '../yjs/ydoc-manager.js';

class KafkaProducerService {
  constructor() {
    this.kafka = null;
    this.producer = null;
    this.isEnabled = false;
    this.isConnected = false;

    // Batch configuration
    this.batchInterval = parseInt(process.env.YDOC_PERSISTENCE_INTERVAL || '5000');
    this.batchThreshold = 10; // Send immediately if changes exceed this

    logger.info('KafkaProducerService initialized (stub mode)');
  }

  /**
   * Initialize Kafka producer
   * Phase 2: Uncomment this to enable actual Kafka connection
   */
  async initialize() {
    try {
      const brokers = process.env.KAFKA_BROKERS;

      if (!brokers) {
        logger.warn('KAFKA_BROKERS not set. Running in stub mode (logs only)');
        this.isEnabled = false;
        return;
      }

      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'mindmap-websocket-service',
        brokers: brokers.split(','),
      });

      this.producer = this.kafka.producer();

      await this.producer.connect();
      this.isConnected = true;
      this.isEnabled = true;

      logger.info('Kafka producer connected successfully', { brokers });
    } catch (error) {
      logger.error('Failed to initialize Kafka producer', {
        error: error.message,
        stack: error.stack,
      });
      this.isEnabled = false;
    }
  }

  /**
   * Start periodic batch sending
   */
  startBatchScheduler() {
    setInterval(() => {
      this.sendBatch();
    }, this.batchInterval);

    logger.info(`Batch scheduler started (interval: ${this.batchInterval}ms)`);
  }

  /**
   * Send batched changes to Kafka
   */
  async sendBatch() {
    const workspaces = ydocManager.getWorkspacesWithChanges();

    if (workspaces.length === 0) {
      return; // No changes to send
    }

    for (const workspaceId of workspaces) {
      const changes = ydocManager.flushPendingChanges(workspaceId);

      if (changes.length === 0) continue;

      // Phase 1: Stub mode - just log
      if (!this.isEnabled || !this.isConnected) {
        logger.info(`[STUB] Would send ${changes.length} changes to Kafka`, {
          workspaceId,
          changes: changes.slice(0, 3), // Log first 3 for brevity
        });
        continue;
      }

      // Phase 2: Actual Kafka send
      try {
        await this.sendToKafka(workspaceId, changes);
        logger.info(`Sent ${changes.length} changes to Kafka`, { workspaceId });
      } catch (error) {
        logger.error('Failed to send changes to Kafka', {
          workspaceId,
          error: error.message,
        });

        // Re-add changes to pending queue on failure
        ydocManager.addPendingChanges(workspaceId, changes);
      }
    }
  }

  /**
   * Send changes to Kafka topic
   * @param {string|number} workspaceId
   * @param {Array} changes - Array of change events
   */
  async sendToKafka(workspaceId, changes) {
    if (!this.producer || !this.isConnected) {
      throw new Error('Kafka producer not connected');
    }

    const topic = process.env.KAFKA_TOPIC_NODE_EVENTS || 'mindmap.node.events';

    await this.producer.send({
      topic,
      messages: [
        {
          key: workspaceId.toString(), // Partition key for ordering
          value: JSON.stringify(changes),
          headers: {
            'content-type': 'application/json',
            'service': 'mindmap-websocket-service',
            'timestamp': new Date().toISOString(),
          },
        },
      ],
    });
  }

  /**
   * Send changes immediately (for large batches)
   * @param {string|number} workspaceId
   */
  async sendImmediately(workspaceId) {
    const changes = ydocManager.flushPendingChanges(workspaceId);

    if (changes.length === 0) return;

    if (!this.isEnabled || !this.isConnected) {
      logger.info(`[STUB] Would immediately send ${changes.length} changes`, {
        workspaceId,
      });
      return;
    }

    try {
      await this.sendToKafka(workspaceId, changes);
      logger.info(`Immediately sent ${changes.length} changes to Kafka`, {
        workspaceId,
      });
    } catch (error) {
      logger.error('Failed to immediately send changes', {
        workspaceId,
        error: error.message,
      });
      ydocManager.addPendingChanges(workspaceId, changes);
    }
  }

  /**
   * Check if changes exceed threshold and send immediately
   * @param {string|number} workspaceId
   */
  checkThreshold(workspaceId) {
    const changes = ydocManager.pendingChanges.get(workspaceId) || [];

    if (changes.length >= this.batchThreshold) {
      logger.info(`Threshold reached for workspace ${workspaceId}, sending immediately`);
      this.sendImmediately(workspaceId);
    }
  }

  /**
   * Graceful shutdown
   */
  async disconnect() {
    if (this.producer && this.isConnected) {
      await this.producer.disconnect();
      logger.info('Kafka producer disconnected');
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.isConnected,
      batchInterval: this.batchInterval,
      batchThreshold: this.batchThreshold,
    };
  }
}

// Export singleton instance
export const kafkaProducer = new KafkaProducerService();
