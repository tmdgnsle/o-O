import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  workspaceId: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
};

/**
 * Creates a Yjs document + y-websocket provider pair that automatically
 * establishes a connection (unless disabled) and exposes helpers for lifecycle
 * control.
 */
export const createYClient = (
  wsUrl: string,
  workspaceId: string,
  options?: { connect?: boolean }
): YClient => {
  const doc = new Y.Doc();
  // Allows callers to pick the websocket endpoint and defer auto-connect when needed
  const provider = new WebsocketProvider(wsUrl, workspaceId, doc, {
    connect: options?.connect ?? true,
  });

  provider.on("status", (event) => {
    console.log("🔌 WebSocket status:", event.status);
  });

  const connect = () => provider.connect();
  const disconnect = () => provider.disconnect();
  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  return {
    doc,
    provider,
    workspaceId,
    connect,
    disconnect,
    destroy,
  };
};
