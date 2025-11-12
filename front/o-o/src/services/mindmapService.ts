import type { NodeData } from "@/features/mindmap/types";
import { mapDtoToNodeData, type NodeDTO } from "./dto/mindmap";

// Optional API base path so the same code works in dev/prod
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Ensures we never end up with double slashes in request URLs
const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

// Raises informative errors instead of returning partially parsed responses
const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `[mindmapService] ${response.status} ${response.statusText}: ${message}`
    );
  }
  return (await response.json()) as T;
};

// Loads the initial node list so we can seed the collaborative Y.Map
export const fetchMindmapNodes = async (
  workspaceId: string
): Promise<NodeData[]> => {
  const response = await fetch(buildApiUrl(`/mindmap/${workspaceId}/nodes`), {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const dtos = await readJson<NodeDTO[]>(response);
  return dtos.filter((dto) => !dto.deleted).map(mapDtoToNodeData);
};
