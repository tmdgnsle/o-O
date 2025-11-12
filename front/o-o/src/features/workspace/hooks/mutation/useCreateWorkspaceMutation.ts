import { useMutation } from "@tanstack/react-query";
import {
  type CreateWorkspaceDTO,
  type WorkspaceDTO,
} from "@/services/dto/workspace.dto";
import { createWorkspace } from "@/services/workspaceService";

export const useCreateWorkspaceMutation = () =>
  useMutation<WorkspaceDTO, unknown, CreateWorkspaceDTO | undefined>({
    mutationKey: ["workspace", "create"],
    mutationFn: (payload) => createWorkspace(payload),
  });
