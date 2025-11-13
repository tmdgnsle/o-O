// yjsClient.ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  workspaceId: string; // room 이름
  wsToken: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
};

/**
 * Yjs 문서 + y-websocket provider 생성
 *
 * - wsUrl: "wss://api.o-o.io.kr/mindmap/ws"
 * - workspaceId: room 이름 (예: "mindmap:3")
 * - wsToken: ST (짧은 유효기간 토큰)
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

  // "mindmap:3" → "3" 으로 변환해서 쿼리 파라미터에 실어보냄
  const cleanWorkspaceId = workspaceId.replace(/^mindmap:/, "");

  // 디버그용 로그
  console.log("🔧 [createYClient] Debug info:", {
    wsUrl,
    originalWorkspaceId: workspaceId,
    cleanWorkspaceId,
    tokenPrefix: wsToken.substring(0, 20) + "...",
  });

  // wsUrl은 그대로 사용 (외부에서 resolveMindmapWsUrl로 만든 값)
  const provider = new WebsocketProvider(
    wsUrl,
    workspaceId, // room 이름은 "mindmap:3" 같은 전체 문자열 그대로 사용
    doc,
    {
      // ✅ 백엔드에서 기대하는 쿼리: ?workspace=3&token=...
      params: {
        workspace: cleanWorkspaceId, // 숫자만 / 순수 ID
        token: wsToken,
      },
    }
  );

  provider.on("status", (event: { status: "connected" | "disconnected" | "connecting" }) => {
    let emoji = "❌";
    if (event.status === "connected") emoji = "✅";
    else if (event.status === "connecting") emoji = "🔄";

    console.log(`${emoji} [y-websocket] status:`, event.status);
  });

  provider.on("sync", (isSynced: boolean) => {
    console.log("🔄 [y-websocket] document sync:", isSynced ? "synced" : "syncing...");
  });

  
  provider.ws?.addEventListener("close", (evt) => {
  console.log(
    "🧯 [y-websocket] WS closed:",
    "code =", evt.code,
    "reason =", evt.reason
  );
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
