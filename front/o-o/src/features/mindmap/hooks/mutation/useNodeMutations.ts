import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NodeData } from '../../pages/MindmapPage';

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
