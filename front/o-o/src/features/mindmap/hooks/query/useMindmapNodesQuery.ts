import { useQuery } from "@tanstack/react-query";
import { fetchMindmapNodes } from "@/services/mindmapService";
import type { NodeData } from "../../types";

/**
 * React Query hook for fetching mindmap nodes
 *
 * @param workspaceId - Current workspace ID
 * @param options - Query options (enabled, refetchInterval, etc.)
 * @returns Query object with data, isLoading, error, etc.
 */
export function useMindmapNodesQuery(
  workspaceId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery<NodeData[], Error>({
    queryKey: ["mindmap", "nodes", workspaceId],
    queryFn: () => fetchMindmapNodes(workspaceId),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
