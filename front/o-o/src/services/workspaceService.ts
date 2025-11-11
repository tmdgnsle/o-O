import { apiClient } from "@/lib/axios";
import type {
  CreateWorkspaceDTO,
  WorkspaceDTO,
} from "@/services/dto/workspace.dto";

export const createWorkspace = async (
  payload?: CreateWorkspaceDTO
): Promise<WorkspaceDTO> => {
  const response = await apiClient.post<WorkspaceDTO>(
    "/workspace",
    payload ?? {}
  );
  return response.data;
};
