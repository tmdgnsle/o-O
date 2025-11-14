import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMindmapNode } from "@/services/mindmapService";
import type { NodeData } from "../../types";

type CreateNodeRequest = {
  parentId?: number | null;
  type: string;
  keyword: string;
  memo?: string;
  x: number;
  y: number;
  color?: string;
};

/**
 * React Query mutation hook for creating a mindmap node
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useCreateNodeMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<NodeData, Error, CreateNodeRequest>({
    mutationFn: (request: CreateNodeRequest) =>
      createMindmapNode(workspaceId, request),
    onSuccess: () => {
      // Invalidate nodes query to refetch
      queryClient.invalidateQueries({ queryKey: ["mindmap", "nodes", workspaceId] });
    },
  });
}
