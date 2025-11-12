import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type WorkspaceVisibility } from "@/services/dto/workspace.dto";
import { updateWorkspaceVisibility } from "@/services/workspaceService";
import { useToast } from "@/shared/ui/ToastProvider";

interface UpdateWorkspaceVisibilityParams {
  workspaceId: string | number;
  visibility: WorkspaceVisibility;
}

export const useUpdateWorkspaceVisibilityMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<void, Error, UpdateWorkspaceVisibilityParams>({
    mutationKey: ["workspace", "updateVisibility"],
    mutationFn: ({ workspaceId, visibility }) =>
      updateWorkspaceVisibility(workspaceId, visibility),
    onSuccess: () => {
      showToast("워크스페이스 공개 설정이 변경되었습니다.", "success");
      // Invalidate workspace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error) => {
      if (error.message.includes("403")) {
        showToast("권한이 없습니다.", "error");
      } else if (error.message.includes("404")) {
        showToast("워크스페이스를 찾을 수 없습니다.", "error");
      } else {
        showToast("공개 설정 변경에 실패했습니다.", "error");
      }
    },
  });
};
