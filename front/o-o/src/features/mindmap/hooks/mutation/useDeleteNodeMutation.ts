import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMindmapNode } from "@/services/mindmapService";

type DeleteNodeRequest = {
  nodeId: number;
};

/**
 * React Query mutation hook for deleting a mindmap node
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useDeleteNodeMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteNodeRequest>({
    mutationFn: ({ nodeId }: DeleteNodeRequest) =>
      deleteMindmapNode(workspaceId, nodeId),
    onSuccess: () => {
      // Invalidate nodes query to refetch
      queryClient.invalidateQueries({ queryKey: ["mindmap", "nodes", workspaceId] });
    },
  });
}
