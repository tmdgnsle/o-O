import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMindmapNode } from "@/services/mindmapService";
import type { NodeData } from "../../types";

type UpdateNodeRequest = {
  nodeId: number;
  keyword?: string | null;
  memo?: string | null;
  x?: number | null;
  y?: number | null;
  color?: string | null;
  parentId?: number | null;
  type?: string | null;
  analysisStatus?: string | null;
};

/**
 * React Query mutation hook for updating a mindmap node
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useUpdateNodeMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<NodeData, Error, UpdateNodeRequest>({
    mutationFn: ({ nodeId, ...request }: UpdateNodeRequest) =>
      updateMindmapNode(workspaceId, nodeId, request),
    onSuccess: () => {
      // Invalidate nodes query to refetch
      queryClient.invalidateQueries({ queryKey: ["mindmap", "nodes", workspaceId] });
    },
  });
}
