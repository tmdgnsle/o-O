import React, { useRef, useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Core } from "cytoscape";
import { useWorkspaceAccessQuery } from "../../workspace/hooks/query/useWorkspaceAccessQuery";
import MiniNav from "@/shared/ui/MiniNav";
import AskPopo from "../components/AskPopoButton";
import StatusBox from "../../workspace/components/StatusBox";
import ModeToggleButton from "../components/ModeToggleButton";
import { Textbox } from "../components/Textbox";
import AnalyzeSelectionPanel from "../components/AnalyzeSelectionPanel";
import D3Canvas from "../components/D3Canvas";
import VoiceChat from "../../workspace/components/VoiceChat/VoiceChat";
import { PeerCursorProvider } from "../../workspace/components/PeerCursorProvider";
import { RemoteCursorsOverlay } from "../../workspace/components/RemoteCursorsOverlay";
import { ChatBubblesOverlay } from "../../workspace/components/ChatBubblesOverlay";
import { ChatInputBubble } from "../../workspace/components/ChatInputBubble";
import { useChatInput } from "../../workspace/hooks/custom/useChatInput";
import { useColorTheme } from "../hooks/useColorTheme";
import { useNodePositioning } from "../hooks/useNodePositioning";
import { useYjsCollaboration } from "../../workspace/hooks/custom/useYjsCollaboration";
import { useCollaborativeNodes } from "../../workspace/hooks/custom/useCollaborativeNodes";
import { useNodeOperations } from "../hooks/custom/useNodeOperations";
import { useMindmapUIState } from "../hooks/custom/useMindmapUIState";
import { useAnalyzeMode } from "../hooks/custom/useAnalyzeMode";
import { useDetachedSelection } from "../hooks/custom/useDetachedSelection";
import { useMindmapSync } from "../hooks/custom/useMindmapSync";
import {
  getPendingImportKeywords,
  clearPendingImportKeywords,
  convertTrendKeywordsToNodes,
} from "../utils/importTrendKeywords";
import {
  DEFAULT_WORKSPACE_ID,
  resolveMindmapWsUrl,
} from "@/constants/mindmapCollaboration";

const MindmapPageContent: React.FC = () => {
  // 1. Routing & workspace params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const navigate = useNavigate();
  const wsUrl = resolveMindmapWsUrl();

  // 2. Get workspace info for role
  const { workspace } = useWorkspaceAccessQuery(workspaceId);

  // 3. Refs for Cytoscape
  const cyRef = useRef<Core | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [cyReady, setCyReady] = useState(false);


  // 4. Helper hooks
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition, findEmptySpace } = useNodePositioning();

  // 5. Stable cursor color (once per session) - separate from node theme colors
  const cursorColorRef = useRef<string | null>(null);
  if (!cursorColorRef.current) {
    // Use cursor-specific color palette for collaboration
    const CURSOR_COLORS = ["#F24822", "#57E257", "#FF824D", "#29DFFF", "#FF50F0", "#FFC60B"];
    cursorColorRef.current = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
  }

  // 6. Collaboration hooks
  const { collab, crud, updateChatState } = useYjsCollaboration(
    wsUrl,
    workspaceId,
    cursorColorRef.current,
    {
      enabled: true, // Mindmap 페이지에서는 항상 활성화
      onAuthError: () => {
        console.warn("[MindmapPage] auth error in collaboration, navigate to home");
        navigate("/"); // 인증 실패 시 홈으로 리다이렉트
      },
      myRole: workspace?.myRole, // 워크스페이스 역할 전달
    }
  );

  const { nodes, isBootstrapping } = useCollaborativeNodes(collab, workspaceId);

  // 🐛 DEBUG: Expose Yjs map to window for console debugging
  useEffect(() => {
    if (collab?.map) {
      (globalThis as any).yNodes = collab.map;
      console.log("[MindmapPage] Yjs map exposed to window.yNodes");
    }
  }, [collab]);

  // 5a. Sync Yjs changes to backend API
  useMindmapSync(workspaceId, collab?.map ?? null, !!collab);

  // 5b. Chat input hook
  const chatInput = useChatInput();

  // 6. UI state hook
  const {
    mode,
    selectedNodeId,
    voiceChatVisible,
    handleModeChange,
    setSelectedNodeId,
    setVoiceChatVisible,
  } = useMindmapUIState();

  // 7. Node operations hook
  const nodeOperations = useNodeOperations({
    crud,
    nodes,
    cyRef,
    mode,
    workspaceId,
    getRandomThemeColor,
    findNonOverlappingPosition,
    findEmptySpace,
  });

  // 8. Analyze mode hook
  const analyzeMode = useAnalyzeMode(nodes, mode);

  // 9. Detached selection hook
  const detachedSelection = useDetachedSelection(nodes, nodeOperations.handleEditNode);

  // 🔥 트렌드 키워드 임포트 (로컬스토리지에서 감지)
  useEffect(() => {
    if (!collab || !crud) return;
    if (isBootstrapping) return; // 부트스트랩 완료 후에만 실행

    const pendingKeywords = getPendingImportKeywords();
    if (!pendingKeywords || pendingKeywords.length === 0) return;

    console.log("[MindmapPage] 트렌드 키워드 임포트:", pendingKeywords);

    // 사용자가 직접 생성한 노드들만 필터링 (백엔드 자동 생성 기본 노드 제외)
    // 백엔드 기본 노드 특징: parentId가 null이고 nodeId가 1인 초기 루트 노드
    const userCreatedNodes = nodes.filter(node => {
      // 백엔드가 자동 생성한 기본 루트 노드는 제외
      return !(node.nodeId === 1 && node.parentId === null && nodes.length === 1);
    });

    const isNewMindmap = userCreatedNodes.length === 0;

    // 키워드를 노드로 변환 (사용자가 생성한 노드들만 전달)
    // 새 마인드맵일 때는 캔버스 중앙(2500, 2500)에 배치
    const newNodes = convertTrendKeywordsToNodes(
      pendingKeywords,
      getRandomThemeColor,
      userCreatedNodes // 사용자가 생성한 노드들만 전달
    );

    // Y.Map에 노드 추가 (순차적으로 부모부터 추가하여 백엔드 동기화 보장)
    // 한 번에 추가하면 부모가 nodeId를 받기 전에 자식이 처리될 수 있음
    const addNodesSequentially = async () => {
      for (const node of newNodes) {
        // 노드 추가
        crud.transact((map) => {
          map.set(node.id, node);
        });

        // 부모 노드인 경우 (parentId가 없는 경우) nodeId를 받을 때까지 대기
        if (!node.parentId) {
          // 루트 노드: 백엔드에서 nodeId를 받을 때까지 대기
          console.log(`[MindmapPage] Waiting for root node ${node.id} to get nodeId...`);
          await waitForNodeId(node.id, 3000); // 최대 3초 대기
        } else {
          // 자식 노드: 짧은 지연만
          console.log(`[MindmapPage] Adding child node ${node.id} with parent ${node.parentId}`);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    };

    // 노드가 백엔드에서 nodeId를 받을 때까지 대기하는 헬퍼 함수
    const waitForNodeId = (nodeId: string, timeout: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!collab?.map) {
          console.warn(`[MindmapPage] No Y.Map available`);
          resolve();
          return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          const node = collab.map.get(nodeId);
          if (node?.nodeId) {
            clearInterval(checkInterval);
            console.log(`[MindmapPage] Node ${nodeId} received nodeId: ${node.nodeId}`);
            resolve();
          } else if (Date.now() - startTime > timeout) {
            clearInterval(checkInterval);
            console.warn(`[MindmapPage] Timeout waiting for nodeId for ${nodeId}`);
            resolve();
          }
        }, 50);
      });
    };

    addNodesSequentially();

    // 로컬스토리지에서 제거
    clearPendingImportKeywords();

    // D3Canvas가 자동으로 첫 노드로 카메라를 이동시킴 (viewport init effect)

    console.log(`[MindmapPage] ${newNodes.length}개의 트렌드 키워드 노드 생성 완료`);
  }, [collab, crud, isBootstrapping, getRandomThemeColor, nodes]);

  // 🔥 Cytoscape mousemove → chatInput 위치 + awareness.cursor 브로드캐스트
  useEffect(() => {
    if (!collab) return;
    if (!cyReady) return;

    const cy = cyRef.current;
    if (!cy) {
      console.log("[MindmapPage] cyRef.current is null, skip cursor binding");
      return;
    }

    const awareness = collab.client.provider.awareness;
    if (!awareness) {
      console.log("[MindmapPage] provider.awareness is null");
      return;
    }

    let raf = 0;
    let lastLog = 0;

    const handleMouseMove = (event: cytoscape.EventObject) => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const position = event.position;
        if (!position) return;

        // 1) ChatInput 위치 업데이트 (모델 좌표)
        chatInput.updateCursorPosition({ x: position.x, y: position.y });

        // 2) Awareness cursor 브로드캐스트
        const cursorData = {
          x: position.x,
          y: position.y,
          color: cursorColorRef.current,
        };

        if (Date.now() - lastLog > 3000) {
          console.log("[MindmapPage] set cursor (model coords):", cursorData);
          lastLog = Date.now();
        }

        awareness.setLocalStateField("cursor", cursorData);
      });
    };

    console.log("[MindmapPage] attach mousemove for awareness cursor + chatInput");
    cy.on("mousemove", handleMouseMove);

    return () => {
      cy.off("mousemove", handleMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [collab, cyReady, chatInput]);

  // 11. Loading state - collab/crud만 체크 (isBootstrapping은 백그라운드에서 진행)
  if (!collab || !crud) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        워크스페이스를 로딩 중입니다...
      </div>
    );
  }

  // 12. Render
  return (
    <PeerCursorProvider awareness={collab.client.provider.awareness}>
      <div className="bg-dotted font-paperlogy h-screen relative overflow-hidden">
        {/* Fixed UI Elements */}
        <div className="fixed top-1 left-1 md:top-4 md:left-4 z-50">
          <MiniNav />
        </div>

        <div className="fixed bottom-24 right-2 lg:bottom-4 lg:right-4 z-50">
          {mode === "edit" ? (
            <AskPopo />
          ) : (
            <AnalyzeSelectionPanel
              selectedNodes={analyzeMode.selectedAnalyzeNodes}
              onAnalyze={analyzeMode.handleAnalyzeExecute}
              onClear={analyzeMode.handleAnalyzeClear}
              onRemoveNode={analyzeMode.handleAnalyzeRemoveNode}
            />
          )}
        </div>

        {!voiceChatVisible && (
          <div className="fixed top-1 right-1 md:top-4 md:right-4 z-50">
            <StatusBox
              onStartVoiceChat={() => setVoiceChatVisible(true)}
              workspaceId={workspaceId}
            />
          </div>
        )}

        {voiceChatVisible ? (
          <div className="fixed top-1 md:top-4 left-1/2 -translate-x-1/2 z-50">
            <VoiceChat
              workspaceId={workspaceId}
              onCallEnd={() => setVoiceChatVisible(false)}
              onOrganize={() => console.log("Organize clicked")}
              onShare={() => console.log("Share clicked")}
            />
          </div>
        ) : (
          <div className="fixed top-1 md:top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 md:gap-2">
            <ModeToggleButton mode={mode} onModeChange={handleModeChange} />
          </div>
        )}

        {mode === "edit" && (
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,48rem)] px-2 md:bottom-4 md:px-4">
            <Textbox onAddNode={nodeOperations.handleAddNode} />
          </div>
        )}

        {/* D3 Canvas */}
        <div className="absolute inset-0" ref={canvasContainerRef}>
          <D3Canvas
            nodes={nodes}
            mode={mode}
            analyzeSelection={analyzeMode.analyzeSelection}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeUnselect={() => setSelectedNodeId(null)}
            onApplyTheme={nodeOperations.handleApplyTheme}
            onDeleteNode={nodeOperations.handleDeleteNode}
            onEditNode={nodeOperations.handleEditNode}
            onBatchNodePositionChange={nodeOperations.handleBatchNodePositionChange}
            onCyReady={(cy) => {
              cyRef.current = cy;
              setCyReady(true);
            }}
            onCreateChildNode={nodeOperations.handleCreateChildNode}
            onAnalyzeNodeToggle={analyzeMode.handleAnalyzeNodeToggle}
            detachedSelectionMap={detachedSelection.detachedSelectionMap}
            onKeepChildrenDelete={detachedSelection.handleKeepChildrenDelete}
            onConnectDetachedSelection={detachedSelection.handleConnectDetachedSelection}
            onDismissDetachedSelection={detachedSelection.handleDismissDetachedSelection}
            className="absolute inset-0"
          />
          <RemoteCursorsOverlay cy={cyRef.current} />
          <ChatBubblesOverlay cy={cyRef.current} awareness={collab.client.provider.awareness} />
          {chatInput.isInputVisible && chatInput.inputPosition && (
            <ChatInputBubble
              cy={cyRef.current}
              position={chatInput.inputPosition}
              color={cursorColorRef.current}
              onClose={chatInput.closeChatInput}
              onUpdateChat={updateChatState}
            />
          )}
        </div>
      </div>
    </PeerCursorProvider>
  );
};

const MindmapPage: React.FC = () => {
  // 1. Extract workspace ID from URL params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;

  // 2. Check workspace access permissions
  const { workspace, hasAccess, isLoading } = useWorkspaceAccessQuery(workspaceId);

  // 3. Show loading state while checking access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        워크스페이스 접근 권한을 확인하는 중...
      </div>
    );
  }

  // 4. If no access, useWorkspaceAccessQuery will redirect automatically
  // Return null to prevent rendering
  if (!hasAccess) {
    return null;
  }

  // 5. Access granted - render the main content
  return <MindmapPageContent />;
};

export default MindmapPage;
