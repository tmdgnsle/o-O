export const DEFAULT_WORKSPACE_ID = "poc-workspace";
export const NODES_YMAP_KEY = "mindmap:nodes";
export const DEFAULT_Y_WEBSOCKET_URL = "ws://localhost:1234";

export const buildMindmapRoomId = (workspaceId: string) =>
  `mindmap:${workspaceId}`;

export const buildMindmapShareLink = (
  workspaceId: string,
  origin?: string
) => {
  const resolvedOrigin =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${resolvedOrigin}/mindmap/${workspaceId}`;
};
