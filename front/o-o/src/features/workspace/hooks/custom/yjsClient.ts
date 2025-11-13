import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  workspaceId: string;
  wsToken: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
};

/**
 * Creates a Yjs document + y-websocket provider pair that automatically
 * establishes a connection (unless disabled) and exposes helpers for lifecycle
 * control.
 *
 * @param wsUrl - WebSocket server URL (e.g., "wss://api.o-o.io.kr/mindmap/ws")
 * @param workspaceId - Workspace identifier
 * @param wsToken - WebSocket authentication token (1-minute validity)
 * @param options - Optional connection settings
 * @returns YClient instance with provider and lifecycle methods
 */
export const createYClient = (
  wsUrl: string,
  workspaceId: string,
  wsToken: string,
  options?: { connect?: boolean }
): YClient => {
  if (!wsUrl) throw new Error("wsUrl missing");
  if (!workspaceId) throw new Error("workspaceId missing");
  if (!wsToken) throw new Error("wsToken missing");
  const doc = new Y.Doc();

  // Extract numeric ID if workspaceId has "mindmap:" prefix
  // Example: "mindmap:3" -> "3"
  const cleanWorkspaceId = workspaceId.replace(/^mindmap:/, "");

  // Debug logging
  console.log("🔧 [createYClient] Debug info:", {
    originalWorkspaceId: workspaceId,
    cleanWorkspaceId,
    wsUrl,
    tokenLength: wsToken.length,
    tokenPrefix: wsToken.substring(0, 20) + "...",
  });

  // Use empty string as room name and pass workspace/token via params option
  // This prevents WebsocketProvider from corrupting the URL by appending "/" after query params
  const provider = new WebsocketProvider(wsUrl, "", doc, {
    connect: options?.connect ?? true,
    params: {
      workspace: cleanWorkspaceId,
      token: wsToken,
    },
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
    wsToken,
    connect,
    disconnect,
    destroy,
  };
};
