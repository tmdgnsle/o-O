import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import MiniNav from "@/shared/ui/MiniNav";
import AskPopo from "../components/AskPopoButton";
import StatusBox from "../components/StatusBox";
import ModeToggleButton from "../components/ModeToggleButton";
import { Textbox } from "../components/Textbox";
import TempNode from "../components/TempNode";
// import ContentDialog from "../components/ContentDialog/ContentDialog";
// import VoiceChat from "../components/VoiceChat";
// import popo1 from "@/shared/assets/images/popo1.png";
// import popo2 from "@/shared/assets/images/popo2.png";
// import popo3 from "@/shared/assets/images/popo3.png";
// import popo4 from "@/shared/assets/images/popo4.png";
// import analyze_popo from "@/shared/assets/images/analyze_popo.png";
import { useNodesQuery } from "../hooks/query/useNodesQuery";
import { useAddNode } from "../hooks/mutation/useNodeMutations";

export type NodeData = {
  id: string;
  text: string;
  x: number;
  y: number;
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
      x: Math.random() * 400 - 200,
      y: Math.random() * 300 - 150,
    };
    addNodeMutation.mutate(newNode);
  };

  // VoiceChat 샘플 유저 데이터
  // const voiceChatUsers = [
  //   {
  //     id: "1",
  //     avatar: popo1,
  //     name: "유저1",
  //     isSpeaking: true,
  //     colorIndex: 1, // 초록
  //   },
  //   {
  //     id: "2",
  //     avatar: popo2,
  //     name: "유저2",
  //     isSpeaking: true,
  //     colorIndex: 4, // 분홍
  //   },
  //   {
  //     id: "3",
  //     avatar: popo3,
  //     name: "유저3",
  //     isSpeaking: true,
  //     colorIndex: 2, // 주황
  //   },
  //   {
  //     id: "4",
  //     avatar: popo4,
  //     name: "유저4",
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "5",
  //     avatar: popo1,
  //     name: "유저5",
  //     isSpeaking: false,
  //   },
  //   {
  //     id: "6",
  //     avatar: popo2,
  //     name: "유저6",
  //     isSpeaking: false,
  //   },
  // ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-dotted font-paperlogy p-6 h-screen">
      <div className="fixed top-4 left-4 z-50">
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

      {/* Render all nodes */}
      <div className="absolute left-1/2 top-1/2">
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <TempNode
              id={node.id}
              text={node.text}
              x={node.x}
              y={node.y}
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
      <ReactQueryDevtools initialIsOpen={false} />
      {/* 테스트용 다이얼로그 - 화면 중앙에 배치 */}
      {/* <ContentDialog
        characterImage={analyze_popo}
        title="테스트"
        buttons={[
          {
            id: "cancel",
            text: "뒤로가기",
            onClick: () => {},
            variant: "outline",
          },
          {
            id: "confirm",
            text: "기획안 작성하기",
            onClick: () => {},
            variant: "default",
          },
        ]}
        content={sampleContent}
      /> */}
    </QueryClientProvider>
  );
};

export default MindmapPage;
