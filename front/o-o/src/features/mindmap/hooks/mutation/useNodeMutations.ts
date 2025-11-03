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
    mutationFn: async ({ nodeId, newText }: { nodeId: string; newText: string }) => {
      const currentNodes = queryClient.getQueryData<NodeData[]>(['nodes']) || [];
      const updatedNodes = currentNodes.map(node =>
        node.id === nodeId ? { ...node, text: newText } : node
      );
      await saveNodes(updatedNodes);
      return updatedNodes;
    },
    onSuccess: (updatedNodes) => {
      queryClient.setQueryData(['nodes'], updatedNodes);
    },
  });
};
