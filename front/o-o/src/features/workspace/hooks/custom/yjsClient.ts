// yjsClient.ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  /** 숫자 워크스페이스 ID (예: "3") */
  workspaceId: string;
  wsToken: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
};

/**
 * Yjs 문서 + y-websocket provider 생성
 *
 * - wsUrl: "wss://api.o-o.io.kr/mindmap/ws"
 * - workspaceId: "3" 같은 워크스페이스 ID (숫자 문자열)
 * - wsToken: ST (짧은 유효기간 토큰)
 *
 * 최종 WebSocket URL 형식:
 *   wss://api.o-o.io.kr/mindmap/ws/workspace:3?token=...
 */
export const createYClient = (
  wsUrl: string,
  workspaceId: string, // "3" 같은 값 기대
  wsToken: string,
  options?: { connect?: boolean }
): YClient => {
  if (!wsUrl) throw new Error("wsUrl missing");
  if (!workspaceId) throw new Error("workspaceId missing");
  if (!wsToken) throw new Error("wsToken missing");

  const doc = new Y.Doc();

  // 혹시 "workspace:3" 형태로 들어와도 숫자만 추출
  const numericWorkspaceId = workspaceId.replace(/^workspace:/, "");

  // y-websocket이 path에 붙일 room 이름 → backend 요구사항에 맞게 "workspace:3"
  const roomName = `workspace:${numericWorkspaceId}`;

  const wsStartTime = performance.now();

  // 최종 URL:
  //   ${wsUrl}/${roomName}?token=...
  //   → wss://api.o-o.io.kr/mindmap/ws/workspace:3?token=...
  const provider = new WebsocketProvider(
    wsUrl,
    roomName,
    doc,
    {
      // ✅ backend가 원하는 쿼리: ?token=...
      params: {
        token: wsToken,
      },
    }
  );

  provider.on("status", (event: { status: "connected" | "disconnected" | "connecting" }) => {
    // Status changed
  });

  provider.on("sync", (isSynced: boolean) => {
    // Sync status changed
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
    workspaceId: numericWorkspaceId, // 내부적으로는 숫자만 유지
    wsToken,
    connect,
    disconnect,
    destroy,
  };
};
