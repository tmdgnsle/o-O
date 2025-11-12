import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type WorkspaceRole } from "@/services/dto/workspace.dto";
import { updateMemberRole } from "@/services/workspaceService";
import { useToast } from "@/shared/ui/ToastProvider";

interface UpdateMemberRoleParams {
  workspaceId: string | number;
  targetUserId: number;
  role: WorkspaceRole;
}

export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<void, Error, UpdateMemberRoleParams>({
    mutationKey: ["workspace", "updateMemberRole"],
    mutationFn: ({ workspaceId, targetUserId, role }) =>
      updateMemberRole(workspaceId, targetUserId, role),
    onSuccess: () => {
      showToast("멤버 권한이 변경되었습니다.", "success");
      // Invalidate workspace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error) => {
      if (error.message.includes("403")) {
        showToast("권한이 없습니다.", "error");
      } else if (error.message.includes("404")) {
        showToast("멤버를 찾을 수 없습니다.", "error");
      } else {
        showToast("권한 변경에 실패했습니다.", "error");
      }
    },
  });
};
