import type { NodeData } from "@/features/mindmap/types";
import { mapDtoToNodeData, type NodeDTO } from "./dto/mindmap.dto";
import { apiClient } from "@/lib/axios";

// Loads the initial node list so we can seed the collaborative Y.Map
export const fetchMindmapNodes = async (
  workspaceId: string
): Promise<NodeData[]> => {
  const { data } = await apiClient.get<NodeDTO[]>(`/mindmap/${workspaceId}/nodes`);
  return data.filter((dto) => !dto.deleted).map(mapDtoToNodeData);
};

// Creates a new mindmap node
export const createMindmapNode = async (
  workspaceId: string,
  request: {
    parentId?: number | null;
    type: string;
    keyword: string;
    memo?: string;
    x: number;
    y: number;
    color?: string;
  }
): Promise<NodeData> => {
  const { data } = await apiClient.post<NodeDTO>(
    `/mindmap/${workspaceId}/node`,
    request
  );
  return mapDtoToNodeData(data);
};

// Updates an existing mindmap node
export const updateMindmapNode = async (
  workspaceId: string,
  nodeId: number,
  request: {
    keyword?: string | null;
    memo?: string | null;
    x?: number | null;
    y?: number | null;
    color?: string | null;
    parentId?: number | null;
    type?: string | null;
    analysisStatus?: string | null;
  }
): Promise<NodeData> => {
  const { data } = await apiClient.patch<NodeDTO>(
    `/mindmap/${workspaceId}/node/${nodeId}`,
    request
  );
  return mapDtoToNodeData(data);
};

// Deletes a mindmap node
export const deleteMindmapNode = async (
  workspaceId: string,
  nodeId: number
): Promise<void> => {
  await apiClient.delete(`/mindmap/${workspaceId}/node/${nodeId}`);
};
