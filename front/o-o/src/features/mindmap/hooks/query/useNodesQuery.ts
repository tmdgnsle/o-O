import { useQuery } from '@tanstack/react-query';
import type { NodeData } from '../../pages/MindmapPage';

// 로컬 스토리지에서 노드 가져오기 (나중에 API로 변경 가능)
const fetchNodes = async (): Promise<NodeData[]> => {
  const stored = localStorage.getItem('mindmap-nodes');
  return stored ? JSON.parse(stored) : [];
};

export const useNodesQuery = () => {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: fetchNodes,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
