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

// 요청 파라미터 타입
export interface WorkspaceQueryParams {
  category?: WorkspaceCategory;
  cursor?: number;
}

export const DEFAULT_WORKSPACE_PARAMS: WorkspaceQueryParams = {
  category: "recent",
};
