export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceRole = "MAINTAINER" | "EDIT" | "VIEW";

export type WorkspaceTheme = "SUMMER_BEACH" | "CITRUS" | "RETRO" | "COOL" | "LAVENDER" | "PASTEL";

export type WorkspaceType = "TEAM" | "PERSONAL";

// --------------------------------------
// REQUEST
// --------------------------------------

// POST /workspace 요청 바디 (선택 필드들)
export interface CreateWorkspaceRequestDTO {
  readonly title?: string;
  readonly theme?: WorkspaceTheme;
  readonly type?: WorkspaceType;
  readonly visibility?: WorkspaceVisibility;
}

// PATCH /workspace/{workspaceId}/member/{targetUserId} 요청 바디
export interface UpdateMemberRoleRequestDTO {
  readonly role: WorkspaceRole;
}

// PATCH /workspace/{workspaceId}/visibility 요청 바디
export interface UpdateWorkspaceVisibilityRequestDTO {
  readonly visibility: WorkspaceVisibility;
}


// --------------------------------------
// RESPONSE
// --------------------------------------

// GET /workspace/{id} 응답
export interface WorkspaceDetailDTO {
  readonly id: number;
  readonly type: WorkspaceType;
  readonly visibility: WorkspaceVisibility;
  readonly title: string;
  readonly thumbnail?: string;
  readonly createdAt: string;       // ISO
  readonly isMember: boolean;
  readonly myRole: WorkspaceRole;
  readonly memberCount: number;
}


// POST /workspace 응답
export interface CreateWorkspaceResponseDTO {
  readonly id: number;
  readonly theme: WorkspaceTheme;
  readonly type: WorkspaceType;
  readonly visibility: WorkspaceVisibility;
  readonly title: string;
  readonly token: string;             // 초대/보안 토큰
}

// POST /workspace/join?token=...
export interface JoinWorkspaceResponseDTO {
  id: number; // 워크스페이스 id (리다이렉트용)
  myRole: WorkspaceRole;
  isMember: boolean; // true
}


