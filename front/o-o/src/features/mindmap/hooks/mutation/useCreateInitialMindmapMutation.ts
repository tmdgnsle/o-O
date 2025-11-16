import { useMutation } from "@tanstack/react-query";
import {
  type InitialMindmapRequestDTO,
  type InitialMindmapResponseDTO,
} from "@/services/dto/mindmap.dto";
import { createInitialMindmap } from "@/services/mindmapService";

export const useCreateInitialMindmapMutation = () =>
  useMutation<
    InitialMindmapResponseDTO,
    unknown,
    InitialMindmapRequestDTO
  >({
    mutationKey: ["mindmap", "createInitial"],
    mutationFn: (request) => createInitialMindmap(request),
  });
