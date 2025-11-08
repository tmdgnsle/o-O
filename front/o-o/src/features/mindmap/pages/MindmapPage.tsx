import React, { useState, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MiniNav from '@/shared/ui/MiniNav';
import AskPopo from '../components/AskPopoButton'
import StatusBox from '../components/StatusBox';
import ModeToggleButton from '../components/ModeToggleButton';
import { Textbox } from '../components/Textbox';
import { useNodesQuery } from '../hooks/query/useNodesQuery';
import { useAddNode, useApplyThemeToAllNodes, useUpdateNodePosition, useBatchUpdateNodePositions } from '../hooks/mutation/useNodeMutations';
import CytoscapeCanvas from '../components/CytoscapeCanvas';
import type { NodeData } from '../types';
import type { Core } from 'cytoscape';
import { useColorTheme } from '../hooks/useColorTheme';
import { useNodePositioning } from '../hooks/useNodePositioning';

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
  const cyRef = useRef<Core | null>(null);

  // Query & Mutation hooks
  const { data: nodes = [], isLoading } = useNodesQuery();
  const addNodeMutation = useAddNode();
  const applyThemeMutation = useApplyThemeToAllNodes();
  const updateNodePositionMutation = useUpdateNodePosition();
  const batchUpdatePositionsMutation = useBatchUpdateNodePositions();

  // Color theme hook
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition } = useNodePositioning();

  const handleAddNode = (text: string) => {
    const randomColor = getRandomThemeColor();

    // 현재 뷰포트 중심 좌표 계산
    let baseX = 0;
    let baseY = 0;

    if (cyRef.current) {
      const pan = cyRef.current.pan();
      const zoom = cyRef.current.zoom();
      const container = cyRef.current.container();

      if (container) {
        // 뷰포트 중심 좌표를 모델 좌표로 변환
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        baseX = (centerX - pan.x) / zoom;
        baseY = (centerY - pan.y) / zoom;
      }
    }

    // 기존 노드와 겹치지 않는 위치 찾기
    const { x, y } = findNonOverlappingPosition(nodes, baseX, baseY);

    const newNode: NodeData = {
      id: Date.now().toString(),
      text,
      x,
      y,
      color: randomColor,
    };
    addNodeMutation.mutate(newNode);
  };

  const handleApplyTheme = useCallback((colors: string[]) => {
    applyThemeMutation.mutate(colors);
  }, [applyThemeMutation]);

  const handleNodePositionChange = useCallback((nodeId: string, x: number, y: number) => {
    // Cytoscape에서 드래그로 위치가 변경되면 노드 데이터 업데이트
    updateNodePositionMutation.mutate({ nodeId, x, y });
  }, [updateNodePositionMutation]);

  const handleBatchNodePositionChange = useCallback((positions: Array<{ id: string; x: number; y: number }>) => {
    // Cola 레이아웃 완료 후 여러 노드 위치를 한 번에 업데이트
    batchUpdatePositionsMutation.mutate(positions);
  }, [batchUpdatePositionsMutation]);

  const handleCreateChildNode = useCallback(({ parentId, parentX, parentY, text }: { parentId: string; parentX: number; parentY: number; text: string }) => {
    if (!text) return;

    const { x, y } = findNonOverlappingPosition(nodes, parentX + 200, parentY);

    const newNode: NodeData = {
      id: Date.now().toString(),
      text,
      x,
      y,
      color: getRandomThemeColor(),
      parentId,
    };

    addNodeMutation.mutate(newNode);
  }, [nodes, findNonOverlappingPosition, getRandomThemeColor, addNodeMutation]);

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
      <div className="fixed bottom-4 right-4 z-50">
        <AskPopo />
      </div>
      <div className="fixed top-4 right-4 z-50">
        <StatusBox />
      </div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <ModeToggleButton />
      </div>

      {/* VoiceChat - 화면 중앙으로 이동 */}
      {/* <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <VoiceChat
          users={voiceChatUsers}
          onMicToggle={(isMuted) => console.log("Mic muted:", isMuted)}
          onCallEnd={() => {}} // 종료 다이얼로그 표시
          onOrganize={() => console.log("Organize clicked")}
          onShare={() => console.log("Share clicked")}
        />
      </div> */}


      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,48rem)] px-4">
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
        onBatchNodePositionChange={handleBatchNodePositionChange}
        onCyReady={(cy) => { cyRef.current = cy; }}
        onCreateChildNode={handleCreateChildNode}
        className="absolute inset-0"
      />
    </div>
  );
};

// Provider로 감싼 MindmapPage
const MindmapPage: React.FC = () => {
  //   const sampleContent = `
  // # 1. 기획 배경

  // - **알고리즘 학습의 어려움**: 완전탐색, BFS 같은 탐색 알고리즘은 개념은 단순하지만, 실제 동작 과정을 이해하기 어려움.
  // - **서비스화의 필요성**: 단순한 코드 구현이 아니라, 시각화와 AI 설명을 통해 직관적으로 이해할 수 있는 환경 제공 필요.
  // - **응용 가능성**: BFS는 경로 탐색, 추천 시스템, 네트워크 분석 등 실제 개발 현장에서 핵심적으로 쓰이고 있어, 교육뿐만 아니라 다양한 서비스로 확장 가능.

  // ## 2. 주요 기능

  // ### 1. 알고리즘 시각화 학습
  // - 완전탐색 & BFS 진행 과정을 단계별 애니메이션으로 제공.
  // - 큐, 그래프, 트리 구조 변화를 실시간으로 확인 가능.

  // ### 2. AI 튜터 챗봇
  // - 사용자가 문제를 입력하면 AI가 풀이 과정을 BFS 방식으로 설명.
  // - 완전탐색과 BFS를 비교하며 효율성 차이를 알려줌.

  // ### 3. 실전 응용 모듈
  // - 예시: 지도 내 최단 경로 탐색, 추천 시스템 미니 시뮬레이터.
  // - 단순 이론이 아닌 실제 개발 서비스 맥락에서 BFS 활용 경험 제공.

  // ## 3. 기대 효과

  // - **학습 효과 강화**: 추상적인 알고리즘 개념을 시각적·대화형으로 이해, 학습 곡선 완화.
  // - **개발 실무 연결**: 알고리즘을 단순 공부가 아니라 실제 서비스 기능과 연결해 학습자 동기 부여.

  // \`\`\`javascript
  // const bfs = (graph, start) => {
  //   const queue = [start];
  //   const visited = new Set();

  //   while (queue.length > 0) {
  //     const node = queue.shift();
  //     visited.add(node);
  //   }
  // };
  // \`\`\`
  //   `;

  return (
    <QueryClientProvider client={queryClient}>
      <MindmapPageContent />
    </QueryClientProvider>
  );
};

export default MindmapPage;
