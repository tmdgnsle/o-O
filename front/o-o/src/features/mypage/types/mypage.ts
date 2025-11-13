export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceCategory = "recent" | "team" | "personal";

export interface Workspace {
  id: number;
  title: string;
  visibility: WorkspaceVisibility;
  createdAt: string;
  thumbnail: string;
  startPrompt: string;
}

export interface WorkspaceListResponse {
  workspaces: Workspace[];
  nextCursor: number;
  hasNext: boolean;
}

export interface Node {
  nodeId: number;
  keyword: string;
}

export interface NodeListResponse {
  workspaceId: number;
  nodes: Node[];
}

export type NodeListResponseArray = NodeListResponse[];

// 요청 파라미터 타입
export interface WorkspaceQueryParams {
  category?: WorkspaceCategory;
  cursor?: number;
}

export const DEFAULT_WORKSPACE_PARAMS: WorkspaceQueryParams = {
  category: "recent",
};

export interface NodeQueryParams {
  from?: string;
  to?: string;
}

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

export const DEFAULT_NODE_PARAMS: NodeQueryParams = {
  from: firstDay.toISOString().split("T")[0],
  to: today.toISOString().split("T")[0],
};
