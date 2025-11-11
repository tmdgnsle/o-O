export interface CreateWorkspaceDTO {
  readonly title?: string;
  readonly description?: string;
}

export interface WorkspaceDTO {
  readonly id: string;
  readonly name?: string;
  readonly visibility?: "PUBLIC" | "PRIVATE";
}
