/**
 * o-O Mindmap Real-time Collaboration Server
 *
 * Y.js WebSocket server for real-time mindmap collaboration
 * - Multi-user real-time editing
 * - Cursor position sharing
 * - Temporary chat (Figma-like "/" feature)
 * - Kafka integration for persistence
 */

import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import * as Y from 'yjs';
import http from 'http';
import { logger } from './utils/logger.js';
import { ydocManager } from './yjs/ydoc-manager.js';
import { awarenessManager } from './yjs/awareness.js';
import { kafkaProducer } from './kafka/producer.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mindmap-websocket-service',
    timestamp: new Date().toISOString(),
    stats: {
      ydoc: ydocManager.getStats(),
      awareness: awarenessManager.getStats(),
      kafka: kafkaProducer.getStatus(),
    },
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  res.json({
    ydoc: ydocManager.getStats(),
    awareness: awarenessManager.getStats(),
    kafka: kafkaProducer.getStatus(),
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws',
});

logger.info('WebSocket server created on path /ws');

/**
 * WebSocket connection handler
 * URL format: ws://host:port/ws?workspace=123
 */
wss.on('connection', (conn, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const workspaceId = url.searchParams.get('workspace');

  if (!workspaceId) {
    logger.warn('Connection rejected: missing workspace parameter');
    conn.close(1008, 'Missing workspace parameter');
    return;
  }

  logger.info(`New connection to workspace ${workspaceId}`);

  // Get or create Y.Doc for this workspace
  const ydoc = ydocManager.getDoc(workspaceId);

  // Get or create Awareness for this workspace
  const awareness = awarenessManager.getAwareness(workspaceId, ydoc);

  // Setup Y.js WebSocket connection using y-websocket utilities
  setupWSConnection(conn, req, {
    docName: `workspace-${workspaceId}`,
    gc: process.env.YDOC_GC_ENABLED === 'true',
  });

  // Track connection count
  const connectionId = Math.random().toString(36).substr(2, 9);

  // Handle connection close
  conn.on('close', () => {
    logger.info(`Connection closed for workspace ${workspaceId}`, { connectionId });

    // Check if this was the last connection
    // Note: This is simplified - in production you'd track all connections per workspace
    const stats = ydocManager.getStats();
    const workspace = stats.workspaces.find(w => w.workspaceId === workspaceId);

    // If no more connections and pending changes, flush to Kafka immediately
    if (workspace && workspace.pendingChanges > 0) {
      logger.info(`Flushing pending changes for workspace ${workspaceId} on disconnect`);
      kafkaProducer.sendImmediately(workspaceId);
    }
  });

  // Handle WebSocket errors
  conn.on('error', (error) => {
    logger.error(`WebSocket error for workspace ${workspaceId}`, {
      error: error.message,
      connectionId,
    });
  });

  // Custom message handler for awareness events
  conn.on('message', (message) => {
    try {
      // Try to parse custom messages (cursor, chat, etc.)
      const data = JSON.parse(message.toString());

      if (data.type === 'awareness') {
        handleAwarenessMessage(workspaceId, connectionId, data);
      }
    } catch (error) {
      // Not a JSON message, likely Y.js binary protocol - ignore
    }
  });

  // Send initial connection success
  conn.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    workspaceId,
    connectionId,
    timestamp: new Date().toISOString(),
  }));
});

/**
 * Handle custom awareness messages
 * Format: { type: 'awareness', event: 'cursor'|'chat', data: {...} }
 */
function handleAwarenessMessage(workspaceId, connectionId, message) {
  const { event, data } = message;

  switch (event) {
    case 'cursor:move':
      awarenessManager.setCursor(connectionId, workspaceId, {
        x: data.x,
        y: data.y,
      });
      break;

    case 'chat:temp':
      awarenessManager.setTempChat(connectionId, workspaceId, {
        message: data.message,
        position: data.position,
        timestamp: new Date().toISOString(),
      });
      break;

    case 'chat:clear':
      awarenessManager.clearTempChat(connectionId, workspaceId);
      break;

    case 'user:info':
      awarenessManager.setUser(connectionId, workspaceId, {
        id: data.userId,
        name: data.userName,
        email: data.userEmail,
        color: data.userColor,
      });
      break;

    default:
      logger.warn(`Unknown awareness event: ${event}`);
  }
}

/**
 * Initialize services and start server
 */
async function startServer() {
  try {
    // Initialize Kafka producer (stub mode in phase 1)
    await kafkaProducer.initialize();

    // Start batch scheduler
    kafkaProducer.startBatchScheduler();

    // Start HTTP server
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
      logger.info(`  - Kafka: ${kafkaProducer.isEnabled ? 'enabled' : 'stub mode'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      // Flush all pending changes before shutdown
      const workspaces = ydocManager.getWorkspacesWithChanges();
      for (const workspaceId of workspaces) {
        await kafkaProducer.sendImmediately(workspaceId);
      }

      // Disconnect Kafka
      await kafkaProducer.disconnect();

      // Close server
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Start the server
startServer();
