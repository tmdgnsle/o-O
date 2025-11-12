import { apiClient } from "@/lib/axios";
import type {
  WorkspaceDetailDTO,
  CreateWorkspaceRequestDTO,
  CreateWorkspaceResponseDTO,
  JoinWorkspaceResponseDTO,
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
