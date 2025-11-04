import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MiniNav from '@/shared/ui/MiniNav';
import AskPopo from '../components/AskPopoButton'
import StatusBox from '../components/StatusBox';
import ModeToggleButton from '../components/ModeToggleButton';
import { Textbox } from '../components/Textbox';
import TempNode from '../components/TempNode';
import { useNodesQuery } from '../hooks/query/useNodesQuery';
import { useAddNode } from '../hooks/mutation/useNodeMutations';

export type NodeData = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        Loading...
      </div>
    );
  }

  return(
    <div className='bg-dotted font-paperlogy p-6 h-screen'>
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

      {/* Render all nodes */}
      <div className='absolute left-1/2 top-1/2'>
        {nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <TempNode
              id={node.id}
              text={node.text}
              x={node.x}
              y={node.y}
              color={node.color}
              isSelected={selectedNodeId === node.id}
              onSelect={() => setSelectedNodeId(node.id)}
              onDeselect={() => setSelectedNodeId(null)}
            />
          </div>
        ))}
      </div>
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
