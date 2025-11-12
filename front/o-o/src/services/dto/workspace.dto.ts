export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceTheme = "SUMMER_BEACH" | (string & {});

export type WorkspaceType = "TEAM" | (string & {});

export interface CreateWorkspaceDTO {
  readonly title?: string;
  readonly description?: string;
  readonly theme?: WorkspaceTheme;
  readonly type?: WorkspaceType;
  readonly visibility?: WorkspaceVisibility;
}

export interface WorkspaceDTO {
  readonly id: number;
  readonly title: string;
  readonly token: string;
  readonly theme: WorkspaceTheme;
  readonly type: WorkspaceType;
  readonly visibility: WorkspaceVisibility;
  readonly description?: string;
}
