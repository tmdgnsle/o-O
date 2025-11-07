import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NodeData } from '../../types';

// 로컬 스토리지에 노드 저장
const saveNodes = async (nodes: NodeData[]) => {
  localStorage.setItem('mindmap-nodes', JSON.stringify(nodes));
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
    mutationFn: async (nodeId: string) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.filter(node => node.id !== nodeId);
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
      newColor
    }: {
      nodeId: string;
      newText?: string;
      newColor?: string;
    }) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            ...(newText !== undefined && { text: newText }),
            ...(newColor !== undefined && { color: newColor }),
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
 * 여러 노드의 위치를 한 번에 업데이트 (Cola 레이아웃 완료 후 사용)
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
