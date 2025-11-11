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
  if (!wsUrl) throw new Error("wsUrl missing");
  if (!workspaceId) throw new Error("workspaceId missing");
  const doc = new Y.Doc();
  // Allows callers to pick the websocket endpoint and defer auto-connect when needed
  const provider = new WebsocketProvider(wsUrl, workspaceId, doc, {
    connect: options?.connect ?? true,
  });

  provider.on("status", (event: { status: "connected" | "disconnected" | "connecting" }) => {
    let emoji = "❌";
    if (event.status === "connected") {
      emoji = "✅";
    } else if (event.status === "connecting") {
      emoji = "🔄";
    }
    console.log(`${emoji} WebSocket status:`, event.status);
  });

  provider.on("sync", (isSynced: boolean) => {
    console.log("🔄 Document sync:", isSynced ? "synced" : "syncing...");
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
