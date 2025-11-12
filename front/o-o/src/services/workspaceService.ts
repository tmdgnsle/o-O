import { apiClient } from "@/lib/axios";
import type {
  WorkspaceDetailDTO,
  CreateWorkspaceRequestDTO,
  CreateWorkspaceResponseDTO,
  JoinWorkspaceResponseDTO,
  UpdateMemberRoleRequestDTO,
  UpdateWorkspaceVisibilityRequestDTO,
  WorkspaceRole,
  WorkspaceVisibility,
} from "@/services/dto/workspace.dto";
import { buildWorkspacePayload } from "@/shared/utils/buildPayloadUtil";


// GET /workspace/{id}
export async function getWorkspace(workspaceId: string | number) {
  const { data } = await apiClient.get<WorkspaceDetailDTO>(`/workspace/${workspaceId}`);
  return data;
}


// POST /workspace
export const createWorkspace = async (
  payload?: CreateWorkspaceRequestDTO
) => {
  const requestPayload = buildWorkspacePayload(payload);
  const { data } = await apiClient.post<CreateWorkspaceResponseDTO>(
    "/workspace",
    requestPayload
  );
  return data;
};

// POST /workspace/join
export const joinWorkspaceByToken = async (token: string) => {
  const { data } = await apiClient.post<JoinWorkspaceResponseDTO>(`/workspace/join?token=${encodeURIComponent(token)}`);
  return data;
};

// PATCH /workspace/{workspaceId}/member/{targetUserId}
export const updateMemberRole = async (
  workspaceId: string | number,
  targetUserId: number,
  role: WorkspaceRole
) => {
  const requestBody: UpdateMemberRoleRequestDTO = { role };
  await apiClient.patch(`/workspace/${workspaceId}/member/${targetUserId}`, requestBody);
};

// PATCH /workspace/{workspaceId}/visibility
export const updateWorkspaceVisibility = async (
  workspaceId: string | number,
  visibility: WorkspaceVisibility
) => {
  const requestBody: UpdateWorkspaceVisibilityRequestDTO = { visibility };
  await apiClient.patch(`/workspace/${workspaceId}/visibility`, requestBody);
};
