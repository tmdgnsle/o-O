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
import { createMindmapNode, fetchMindmapNodes } from "@/services/mindmapService";
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
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);


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

    // 🔥 중복 실행 방지: 로컬스토리지에서 즉시 제거
    clearPendingImportKeywords();

    // 백엔드에 직접 순차적으로 노드 생성
    const addNodesSequentially = async () => {
      console.log("[MindmapPage] 🔥 백엔드에 직접 순차적 노드 생성 시작");

      // 백엔드에서 최신 노드 목록 먼저 조회
      console.log("[MindmapPage] 🔄 기존 노드 목록 조회 중...");
      const existingNodesFromBackend = await fetchMindmapNodes(workspaceId);
      console.log("[MindmapPage] ✅ 기존 노드 수:", existingNodesFromBackend.length);

      // 백엔드 자동 생성 기본 루트 노드(nodeId === 1) 제외
      const existingNodes = existingNodesFromBackend.filter(node => {
        return !(node.nodeId === 1 && existingNodesFromBackend.length === 1);
      });

      // 키워드를 노드로 변환
      // 기존 노드가 있으면 오른쪽에 배치, 없으면 중앙(2500, 2500)에 배치
      const newNodes = convertTrendKeywordsToNodes(
        pendingKeywords,
        getRandomThemeColor,
        existingNodes // 기존 노드 정보 전달하여 겹치지 않게 배치
      );

      console.log("[MindmapPage] 📍 새 노드 배치 정보:", {
        firstNodeX: newNodes[0]?.x,
        firstNodeY: newNodes[0]?.y,
        existingNodesCount: existingNodes.length,
        isNewMindmap: existingNodes.length === 0
      });

      let lastCreatedNodeId: number | null = null;
      let firstCreatedNodeId: number | null = null; // 🔥 첫 번째 노드 ID 저장

      for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i];

        // parentId 결정: 첫 노드는 null, 이후는 이전 노드의 nodeId
        const backendParentId = i === 0 ? null : lastCreatedNodeId;

        console.log(`[MindmapPage] [${i + 1}/${newNodes.length}] Creating node:`, {
          keyword: node.keyword,
          parentId: backendParentId,
          x: node.x,
          y: node.y,
        });

        try {
          // 백엔드에 직접 생성 요청
          const createdNode = await createMindmapNode(workspaceId, {
            parentId: backendParentId,
            type: node.type || "text",
            keyword: node.keyword,
            memo: node.memo,
            x: node.x ?? 0,
            y: node.y ?? 0,
            color: node.color,
          });

          console.log(`[MindmapPage] ✅ Node created:`, {
            keyword: createdNode.keyword,
            nodeId: createdNode.nodeId,
            parentId: createdNode.parentId,
          });

          // 생성된 nodeId를 다음 노드의 parentId로 사용
          lastCreatedNodeId = createdNode.nodeId as number;

          // 🔥 첫 번째 노드의 ID를 저장 (카메라 포커스용)
          if (i === 0) {
            firstCreatedNodeId = createdNode.nodeId as number;
          }

        } catch (error) {
          console.error(`[MindmapPage] ❌ Failed to create node:`, error);
          // 실패 시 중단
          break;
        }
      }

      console.log("[MindmapPage] 🎉 모든 노드 생성 완료", { firstCreatedNodeId });

      // 백엔드에서 모든 노드 다시 조회
      console.log("[MindmapPage] 🔄 백엔드에서 노드 목록 다시 조회 중...");
      const allNodes = await fetchMindmapNodes(workspaceId);
      console.log("[MindmapPage] ✅ 조회된 노드 수:", allNodes.length);

      // Yjs Map에 노드들 반영 (remote origin으로 설정하여 useMindmapSync 트리거 방지)
      if (collab?.map) {
        // crud.transact가 아니라 Y.Doc의 transact를 직접 사용 (origin 제어)
        collab.map.doc?.transact(() => {
          // 기존 노드 모두 제거
          collab.map.clear();

          // 백엔드에서 조회한 노드들로 다시 채우기
          for (const node of allNodes) {
            collab.map.set(node.id, node);
          }

          console.log("[MindmapPage] ✅ Yjs Map에 노드 반영 완료");
        }, "remote");
      }

      // 🔥 백엔드에서 조회한 노드 중 첫 번째로 생성된 노드 ID로 찾기 (키워드 중복 방지)
      if (firstCreatedNodeId) {
        const matchedNode = allNodes.find(node => node.nodeId === firstCreatedNodeId);
        if (matchedNode) {
          console.log("[MindmapPage] 📍 포커스할 노드 ID 설정:", {
            id: matchedNode.id,
            nodeId: matchedNode.nodeId,
            keyword: matchedNode.keyword,
            position: { x: matchedNode.x, y: matchedNode.y }
          });
          setFocusNodeId(matchedNode.id);
        } else {
          console.warn("[MindmapPage] ⚠️ 매칭되는 노드를 찾을 수 없음 (nodeId):", firstCreatedNodeId);
        }
      }
    };

    addNodesSequentially()
      .then(() => {
        console.log("[MindmapPage] ✅ 트렌드 키워드 임포트 완료");
      })
      .catch((error) => {
        console.error("[MindmapPage] ❌ 트렌드 키워드 임포트 실패:", error);
      });
  }, [collab, crud, isBootstrapping, workspaceId, getRandomThemeColor]);

  // 🔥 포커스 노드로 카메라 이동 (cyRef를 통해 focusOnNode 호출)
  useEffect(() => {
    if (!focusNodeId) {
      return;
    }

    console.log("[MindmapPage] 📍 포커스 노드:", focusNodeId);

    // nodes에서 해당 노드 찾기 (노드가 실제로 존재하는지 확인)
    const targetNode = nodes.find(n => n.id === focusNodeId);

    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
      console.log("[MindmapPage] 📍 카메라 이동 시작:", {
        id: targetNode.id,
        keyword: targetNode.keyword,
        x: targetNode.x,
        y: targetNode.y
      });

      // cyRef의 focusOnNode 메서드 사용
      const timer = setTimeout(() => {
        if (cyRef.current && typeof (cyRef.current as any).focusOnNode === 'function') {
          (cyRef.current as any).focusOnNode(focusNodeId);
          console.log("[MindmapPage] ✅ focusOnNode 호출 완료");
        } else {
          console.warn("[MindmapPage] ⚠️ cyRef.current.focusOnNode이 준비되지 않음");
        }

        setFocusNodeId(null);
      }, 200); // DOM 렌더링 대기

      return () => clearTimeout(timer);
    } else {
      console.warn("[MindmapPage] ⚠️ 노드를 찾을 수 없거나 좌표가 없음:", focusNodeId, {
        nodesLength: nodes.length,
        hasTargetNode: !!targetNode
      });
      // 🔥 노드를 못 찾으면 포커스 유지 (다음 nodes 업데이트 시 재시도)
    }
  }, [focusNodeId, nodes]);

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
