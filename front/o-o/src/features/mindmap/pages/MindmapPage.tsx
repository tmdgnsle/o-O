import React, { useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Core } from "cytoscape";
import { useWorkspaceAccessQuery } from "../../workspace/hooks/query/useWorkspaceAccessQuery";
import MiniNav from "@/shared/ui/MiniNav";
import AskPopo from "../components/AskPopoButton";
import StatusBox from "../../workspace/components/StatusBox";
import ModeToggleButton from "../components/ModeToggleButton";
import { Textbox } from "../components/Textbox";
import AnalyzeSelectionPanel from "../components/AnalyzeSelectionPanel";
import CytoscapeCanvas from "../components/CytoscapeCanvas";
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
import popo1 from "@/shared/assets/images/popo1.png";
import popo2 from "@/shared/assets/images/popo2.png";
import popo3 from "@/shared/assets/images/popo3.png";
import {
  DEFAULT_WORKSPACE_ID,
  buildMindmapShareLink,
  resolveMindmapWsUrl,
} from "@/constants/mindmapCollaboration";

const MindmapPageContent: React.FC = () => {
  // 1. Routing & workspace params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const navigate = useNavigate();
  const shareLink = useMemo(() => buildMindmapShareLink(workspaceId), [workspaceId]);
  const wsUrl = resolveMindmapWsUrl();

  // 2. Refs for Cytoscape
  const cyRef = useRef<Core | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // 3. Helper hooks
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition } = useNodePositioning();

  // 4. Stable cursor color (once per session)
  const cursorColorRef = useRef<string | null>(null);
  if (!cursorColorRef.current) {
    cursorColorRef.current = getRandomThemeColor();
  }

  // 5. Collaboration hooks
  const { collab, crud, updateChatState } = useYjsCollaboration(
    wsUrl,
    workspaceId,
    cyRef,
    cursorColorRef.current,
    {
      enabled: true, // Mindmap 페이지에서는 항상 활성화
      onAuthError: () => {
        console.warn("[MindmapPage] auth error in collaboration, navigate to home");
        navigate("/"); // 인증 실패 시 홈으로 리다이렉트
      },
    }
  );

  const { nodes, isBootstrapping } = useCollaborativeNodes(collab, workspaceId);


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
    getRandomThemeColor,
    findNonOverlappingPosition,
  });

  // 8. Analyze mode hook
  const analyzeMode = useAnalyzeMode(nodes, mode);

  // 9. Detached selection hook
  const detachedSelection = useDetachedSelection(nodes, nodeOperations.handleEditNode);

  // 10. Voice chat users (mock data)
  const voiceChatUsers = useMemo(() => [
    { id: "1", name: "사용자 A", avatar: popo1, isSpeaking: true, colorIndex: 0 },
    { id: "2", name: "사용자 B", avatar: popo2, colorIndex: 1 },
    { id: "3", name: "사용자 C", avatar: popo3, colorIndex: 2 },
  ], []);

  // 10b. Track cursor position for chat input (model coordinates only)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleMouseMove = (event: cytoscape.EventObject) => {
      const position = event.position;
      if (!position) return;

      // Store model coordinates directly (no screen coordinate conversion)
      chatInput.updateCursorPosition({ x: position.x, y: position.y });
    };

    cy.on("mousemove", handleMouseMove);
    return () => {
      cy.off("mousemove", handleMouseMove);
    };
  }, [cyRef.current, chatInput]);

  // 11. Loading state
  if (!collab || !crud || isBootstrapping) {
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
              shareLink={shareLink}
              workspaceId={workspaceId}
            />
          </div>
        )}

        {voiceChatVisible ? (
          <div className="fixed top-1 md:top-4 left-1/2 -translate-x-1/2 z-50">
            <VoiceChat
              users={voiceChatUsers}
              onMicToggle={(isMuted) => console.log("Mic muted:", isMuted)}
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

        {/* Cytoscape Canvas */}
        <div className="absolute inset-0" ref={canvasContainerRef}>
          <CytoscapeCanvas
            nodes={nodes}
            mode={mode}
            analyzeSelection={analyzeMode.analyzeSelection}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeUnselect={() => setSelectedNodeId(null)}
            onApplyTheme={nodeOperations.handleApplyTheme}
            onDeleteNode={nodeOperations.handleDeleteNode}
            onEditNode={nodeOperations.handleEditNode}
            onNodePositionChange={nodeOperations.handleNodePositionChange}
            onBatchNodePositionChange={nodeOperations.handleBatchNodePositionChange}
            onCyReady={(cy) => { cyRef.current = cy; }}
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
  const { hasAccess, isLoading } = useWorkspaceAccessQuery(workspaceId);

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
