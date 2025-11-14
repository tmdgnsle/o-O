import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NodeData } from '../../types';

// 로컬 스토리지에 노드 저장
const saveNodes = async (nodes: NodeData[]) => {
  localStorage.setItem('mindmap1-nodes', JSON.stringify(nodes));
  return nodes;
};

export const useAddNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNode: NodeData) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = [...currentNodes, newNode];
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};

export const useDeleteNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nodeId, deleteDescendants = false }: { nodeId: string; deleteDescendants?: boolean }) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const idsToDelete = new Set<string>([nodeId]);

      if (deleteDescendants) {
        const childrenMap = currentNodes.reduce<Map<string, string[]>>((acc, node) => {
          if (!node.parentId) {
            return acc;
          }
          if (!acc.has(node.parentId)) {
            acc.set(node.parentId, []);
          }
          acc.get(node.parentId)!.push(node.id);
          return acc;
        }, new Map());

        const stack = [nodeId];
        while (stack.length > 0) {
          const currentId = stack.pop()!;
          const children = childrenMap.get(currentId);
          if (!children) continue;
          for (const childId of children) {
            if (!idsToDelete.has(childId)) {
              idsToDelete.add(childId);
              stack.push(childId);
            }
          }
        }
      }

      const updatedNodes = currentNodes.filter(node => !idsToDelete.has(node.id));
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};

export const useEditNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nodeId,
      newText,
      newColor,
      newParentId,
    }: {
      nodeId: string;
      newText?: string;
      newColor?: string;
      newParentId?: string | null;
    }) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            ...(newText !== undefined && { text: newText }),
            ...(newColor !== undefined && { color: newColor }),
            ...(newParentId !== undefined && { parentId: newParentId ?? undefined }),
          };
        }
        return node;
      });
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};

export const useApplyThemeToAllNodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (colors: string[]) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.map((node, index) => ({
        ...node,
        color: colors[index % colors.length], // 순환하며 색상 할당
      }));
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};

export const useUpdateNodePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nodeId, x, y }: { nodeId: string; x: number; y: number }) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, x, y };
        }
        return node;
      });
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};

/**
 * 여러 노드의 위치를 한 번에 업데이트
 * - 개별 mutation 대신 batch 업데이트로 성능 개선
 * - 200개 노드 = 200번 localStorage write → 1번 write
 */
export const useBatchUpdateNodePositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positions: Array<{ id: string; x: number; y: number }>) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];

      // O(1) 룩업을 위한 Map 생성
      const positionMap = new Map(positions.map(p => [p.id, p]));

      // 단일 패스로 업데이트
      const updatedNodes = currentNodes.map(node => {
        const newPos = positionMap.get(node.id);
        if (newPos) {
          return { ...node, x: newPos.x, y: newPos.y };
        }
        return node;
      });

      // 단일 localStorage write
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};
