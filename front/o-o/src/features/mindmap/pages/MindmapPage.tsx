import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MiniNav from '@/shared/ui/MiniNav';
import AskPopo from '../components/AskPopoButton'
import StatusBox from '../components/StatusBox';
import ModeToggleButton from '../components/ModeToggleButton';
import { Textbox } from '../components/Textbox';
import { useNodesQuery } from '../hooks/query/useNodesQuery';
import { useAddNode, useApplyThemeToAllNodes, useUpdateNodePosition } from '../hooks/mutation/useNodeMutations';
import CytoscapeCanvas from '../components/CytoscapeCanvas';

export type NodeData = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId?: string; // 부모 노드 ID (edge 연결용)
};

export type EdgeData = {
  id: string;
  source: string;
  target: string;
};

// MindmapPage 전용 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

const MindmapPageContent: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Query & Mutation hooks
  const { data: nodes = [], isLoading } = useNodesQuery();
  const addNodeMutation = useAddNode();
  const applyThemeMutation = useApplyThemeToAllNodes();
  const updateNodePositionMutation = useUpdateNodePosition();

  const handleAddNode = (text: string) => {
    const newNode: NodeData = {
      id: Date.now().toString(),
      text,
      x: Math.random() * 400 - 200, // random position near center
      y: Math.random() * 300 - 150,
      color: '#263A6B', // 기본 색상
    };
    addNodeMutation.mutate(newNode);
  };

  const handleApplyTheme = (colors: string[]) => {
    applyThemeMutation.mutate(colors);
  };

  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    // Cytoscape에서 드래그로 위치가 변경되면 노드 데이터 업데이트
    updateNodePositionMutation.mutate({ nodeId, x, y });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        Loading...
      </div>
    );
  }

  return(
    <div className='bg-dotted font-paperlogy h-screen relative overflow-hidden'>
      {/* Fixed UI Elements */}
      <div className='fixed top-4 left-4 z-50'>
        <MiniNav />
      </div>
      <div className='fixed bottom-4 right-4 z-50'>
        <AskPopo />
      </div>
      <div className='fixed top-4 right-4 z-50'>
        <StatusBox />
      </div>
      <div className='fixed top-4 left-1/2 -translate-x-1/2 z-50'>
        <ModeToggleButton />
      </div>
      <div className='fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,48rem)] px-4'>
        <Textbox onAddNode={handleAddNode} />
      </div>

      {/* Cytoscape Canvas - 전체 화면 */}
      <CytoscapeCanvas
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={setSelectedNodeId}
        onNodeUnselect={() => setSelectedNodeId(null)}
        onApplyTheme={handleApplyTheme}
        onNodePositionChange={handleNodePositionChange}
        className="absolute inset-0"
      />
    </div>
  );
};

// Provider로 감싼 MindmapPage
const MindmapPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MindmapPageContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default MindmapPage;
