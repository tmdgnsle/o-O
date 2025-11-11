import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import * as Y from "yjs";
import { useParams } from "react-router-dom";
import MiniNav from "@/shared/ui/MiniNav";
import AskPopo from "../components/AskPopoButton";
import StatusBox from "../components/StatusBox";
import ModeToggleButton from "../components/ModeToggleButton";
import { Textbox } from "../components/Textbox";
import AnalyzeSelectionPanel from "../components/AnalyzeSelectionPanel";
import CytoscapeCanvas from "../components/CytoscapeCanvas";
import VoiceChat from "../components/VoiceChat/VoiceChat";
import { fetchMindmapNodes } from "@/services/mindmapService";
import type {
  NodeData,
  MindmapMode,
  DetachedSelectionState,
  DeleteNodePayload,
  EditNodePayload,
} from "../types";
import type { Core } from "cytoscape";
import { useColorTheme } from "../hooks/useColorTheme";
import { useNodePositioning } from "../hooks/useNodePositioning";
import popo1 from "@/shared/assets/images/popo1.png";
import popo2 from "@/shared/assets/images/popo2.png";
import popo3 from "@/shared/assets/images/popo3.png";
import { createYClient, type YClient } from "../collaboration/yjsClient";
import { useYMapState } from "../collaboration/useYMapState";
import { createYMapCrud } from "../collaboration/yMapCrud";
import {
  DEFAULT_WORKSPACE_ID,
  DEFAULT_Y_WEBSOCKET_URL,
  NODES_YMAP_KEY,
  buildMindmapRoomId,
  buildMindmapShareLink,
} from "../collaboration/constants";

// Tracks peer cursor metadata broadcast over Yjs awareness
type CursorAwareness = {
  x: number;
  y: number;
  color?: string;
};

const MindmapPageContent: React.FC = () => {
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const roomId = useMemo(() => buildMindmapRoomId(workspaceId), [workspaceId]);
  const shareLink = useMemo(() => buildMindmapShareLink(workspaceId), [workspaceId]);
  const wsUrl = import.meta.env.VITE_Y_WEBSOCKET_URL ?? DEFAULT_Y_WEBSOCKET_URL;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mode, setMode] = useState<MindmapMode>("edit");
  const [analyzeSelection, setAnalyzeSelection] = useState<string[]>([]);
  const [voiceChatVisible, setVoiceChatVisible] = useState(false);
  const [detachedSelectionMap, setDetachedSelectionMap] = useState<Record<string, DetachedSelectionState>>({});
  const cyRef = useRef<Core | null>(null);
  const [collab, setCollab] = useState<{ client: YClient; map: Y.Map<NodeData> } | null>(null);

  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition } = useNodePositioning();

  // Prevents duplicate REST bootstraps per workspace
  const hasBootstrappedRef = useRef(false);
  // Stable color used for local awareness cursor
  const cursorColorRef = useRef<string | null>(null);
  // Keeps remote awareness cursors mirrored in React state
  const [peerCursors, setPeerCursors] = useState<Record<number, CursorAwareness>>({});
  // Derived count used for instrumentation/testing hooks
  const remoteCursorCount = useMemo(() => Object.keys(peerCursors).length, [peerCursors]);

  // Lazily assign cursor color once per session
  if (!cursorColorRef.current) {
    cursorColorRef.current = getRandomThemeColor();
  }

  useEffect(() => {
    const client = createYClient(wsUrl, roomId);
    const map = client.doc.getMap<NodeData>(NODES_YMAP_KEY);
    setCollab({ client, map });

    return () => {
      setCollab(null);
      client.destroy();
    };
  }, [roomId, wsUrl]);

  // Reset bootstrap guard whenever the workspace changes
  useEffect(() => {
    hasBootstrappedRef.current = false;
  }, [workspaceId]);

  // Seed the collaborative document with REST data exactly once
  useEffect(() => {
    if (!collab || hasBootstrappedRef.current) {
      return;
    }

    if (collab.map.size > 0) {
      hasBootstrappedRef.current = true;
      return;
    }

    hasBootstrappedRef.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        const restNodes = await fetchMindmapNodes(workspaceId);
        if (cancelled || restNodes.length === 0) {
          return;
        }
        collab.client.doc.transact(() => {
          restNodes.forEach((node) => {
            if (!collab.map.has(node.id)) {
              collab.map.set(node.id, node);
            }
          });
        }, "mindmap-bootstrap");
      } catch (error) {
        if (!cancelled) {
          hasBootstrappedRef.current = false;
          console.error("[MindmapPage] Failed to bootstrap nodes:", error);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [collab, workspaceId]);

  const nodesState = useYMapState<NodeData>(collab?.map);
  const nodes = useMemo<NodeData[]>(() => Object.values(nodesState), [nodesState]);

  const crud = useMemo(() => {
    if (!collab) {
      return null;
    }
    return createYMapCrud<NodeData>(collab.client.doc, collab.map, "mindmap-page");
  }, [collab]);

  useEffect(() => {
    setAnalyzeSelection([]);
    if (mode === "analyze") {
      setSelectedNodeId(null);
    }
  }, [mode]);

  const handleModeChange = useCallback((nextMode: MindmapMode) => {
    setMode(nextMode);
  }, []);

  const handleAddNode = useCallback((text: string) => {
    if (mode === "analyze" || !crud) return;
    const randomColor = getRandomThemeColor();

    let baseX = 0;
    let baseY = 0;

    if (cyRef.current) {
      const pan = cyRef.current.pan();
      const zoom = cyRef.current.zoom();
      const container = cyRef.current.container();

      if (container) {
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        baseX = (centerX - pan.x) / zoom;
        baseY = (centerY - pan.y) / zoom;
      }
    }

    const { x, y } = findNonOverlappingPosition(nodes, baseX, baseY);

    const newNode: NodeData = {
      id: Date.now().toString(),
      text,
      x,
      y,
      color: randomColor,
    };
    crud.set(newNode.id, newNode);
  }, [crud, findNonOverlappingPosition, getRandomThemeColor, mode, nodes]);

  const handleApplyTheme = useCallback((colors: string[]) => {
    if (!crud || colors.length === 0) return;
    const entries = nodes.map((node, index) => [
      node.id,
      {
        ...node,
        color: colors[index % colors.length],
      },
    ]) as Array<[string, NodeData]>;
    crud.setMany(entries);
  }, [crud, nodes]);

  const handleNodePositionChange = useCallback((nodeId: string, x: number, y: number) => {
    if (!crud) return;
    crud.update(nodeId, (current) => {
      if (!current) return current;
      return { ...current, x, y };
    });
  }, [crud]);

  const handleBatchNodePositionChange = useCallback((positions: Array<{ id: string; x: number; y: number }>) => {
    if (!crud || positions.length === 0) return;
    const positionMap = new Map(positions.map((pos) => [pos.id, pos]));

    crud.transact((map) => {
      positionMap.forEach(({ id, x, y }) => {
        const current = map.get(id);
        if (!current) return;
        map.set(id, { ...current, x, y });
      });
    });
  }, [crud]);

  const handleCreateChildNode = useCallback(({
    parentId,
    parentX,
    parentY,
    text,
  }: {
    parentId: string;
    parentX: number;
    parentY: number;
    text: string;
  }) => {
    if (!crud || !text) return;

    const { x, y } = findNonOverlappingPosition(nodes, parentX + 200, parentY);

    const newNode: NodeData = {
      id: Date.now().toString(),
      text,
      x,
      y,
      color: getRandomThemeColor(),
      parentId,
    };

    crud.set(newNode.id, newNode);
  }, [crud, findNonOverlappingPosition, getRandomThemeColor, nodes]);

  const handleDeleteNode = useCallback(({ nodeId, deleteDescendants }: DeleteNodePayload) => {
    if (!crud) return;

    const idsToDelete = new Set<string>([nodeId]);

    if (deleteDescendants) {
      const childrenMap = nodes.reduce<Record<string, string[]>>((acc, node) => {
        if (!node.parentId) {
          return acc;
        }
        if (!acc[node.parentId]) {
          acc[node.parentId] = [];
        }
        acc[node.parentId]!.push(node.id);
        return acc;
      }, {});

      const stack = [nodeId];
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        const children = childrenMap[currentId];
        if (!children) continue;
        children.forEach((childId) => {
          if (!idsToDelete.has(childId)) {
            idsToDelete.add(childId);
            stack.push(childId);
          }
        });
      }
    }

    crud.transact((map) => {
      idsToDelete.forEach((id) => {
        map.delete(id);
      });
    });
  }, [crud, nodes]);

  const handleEditNode = useCallback(({ nodeId, newText, newColor, newParentId }: EditNodePayload) => {
    if (!crud) return;
    crud.update(nodeId, (current) => {
      if (!current) return current;
      return {
        ...current,
        ...(newText !== undefined ? { text: newText } : {}),
        ...(newColor !== undefined ? { color: newColor } : {}),
        ...(newParentId !== undefined ? { parentId: newParentId ?? undefined } : {}),
      };
    });
  }, [crud]);

  const handleAnalyzeNodeToggle = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  const handleAnalyzeClear = useCallback(() => {
    setAnalyzeSelection([]);
  }, []);

  const handleAnalyzeExecute = useCallback(() => {
    if (analyzeSelection.length === 0) return;
    console.log("Analyze nodes:", analyzeSelection);
  }, [analyzeSelection]);

  const handleAnalyzeRemoveNode = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) => prev.filter((id) => id !== nodeId));
  }, []);

  const handleKeepChildrenDelete = useCallback(({
    deletedNodeId,
    parentId = null,
  }: {
    deletedNodeId: string;
    parentId?: string | null;
  }) => {
    if (!crud) return;

    const orphanRoots = nodes.filter((node) => node.parentId === deletedNodeId);
    if (orphanRoots.length === 0) return;

    const timestamp = Date.now();
    setDetachedSelectionMap((prev) => {
      const next = { ...prev };
      orphanRoots.forEach((child, index) => {
        next[child.id] = {
          id: `${deletedNodeId}-${child.id}-${timestamp + index}`,
          anchorNodeId: child.id,
          originalParentId: deletedNodeId,
          targetParentId: parentId,
        };
      });
      return next;
    });

    orphanRoots.forEach((child) => {
      handleEditNode({ nodeId: child.id, newParentId: null });
    });
  }, [crud, handleEditNode, nodes]);

  const handleConnectDetachedSelection = useCallback((anchorNodeId: string) => {
    let selection: DetachedSelectionState | undefined;
    setDetachedSelectionMap((prev) => {
      selection = prev[anchorNodeId];
      if (!selection) {
        return prev;
      }
      const { [anchorNodeId]: _, ...rest } = prev;
      return rest;
    });

    if (!selection) return;

    handleEditNode({
      nodeId: selection.anchorNodeId,
      newParentId: selection.targetParentId ?? null,
    });
  }, [handleEditNode]);

  const handleDismissDetachedSelection = useCallback((anchorNodeId: string) => {
    setDetachedSelectionMap((prev) => {
      if (!prev[anchorNodeId]) return prev;
      const { [anchorNodeId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  useEffect(() => {
    setDetachedSelectionMap((prev) => {
      let mutated = false;
      const next: Record<string, DetachedSelectionState> = { ...prev };

      Object.entries(prev).forEach(([anchorId, selection]) => {
        const anchorExists = nodes.some((node) => node.id === selection.anchorNodeId);
        if (!anchorExists) {
          delete next[anchorId];
          mutated = true;
        }
      });

      return mutated ? next : prev;
    });
  }, [nodes]);

  // Mirror y-websocket awareness updates into React state
  useEffect(() => {
    if (!collab) {
      return;
    }

    const awareness = collab.client.provider.awareness;
    if (!awareness) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      awareness.setLocalStateField("cursor", {
        x: event.clientX,
        y: event.clientY,
        color: cursorColorRef.current,
      });
    };

    const handleAwarenessChange = () => {
      const next: Record<number, CursorAwareness> = {};
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) {
          return;
        }

        const cursorState = (state as { cursor?: CursorAwareness }).cursor;
        if (cursorState) {
          next[clientId] = cursorState;
        }
      });
      setPeerCursors(next);
    };

    window.addEventListener("mousemove", handleMouseMove);
    awareness.on("change", handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      awareness.off("change", handleAwarenessChange);
      awareness.setLocalStateField("cursor", null);
    };
  }, [collab]);

  const selectedAnalyzeNodes = useMemo(
    () => nodes.filter((node) => analyzeSelection.includes(node.id)),
    [nodes, analyzeSelection]
  );

  const voiceChatUsers = useMemo(() => [
    { id: "1", name: "포포 A", avatar: popo1, isSpeaking: true, colorIndex: 0 },
    { id: "2", name: "포포 B", avatar: popo2, colorIndex: 1 },
    { id: "3", name: "포포 C", avatar: popo3, colorIndex: 2 },
  ], []);

  if (!collab || !crud) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        워크스페이스에 연결 중입니다...
      </div>
    );
  }

  return(
    <div className='bg-dotted font-paperlogy h-screen relative overflow-hidden' data-remote-cursors={remoteCursorCount}>
      {/* Fixed UI Elements */}
      <div className='fixed top-4 left-4 z-50'>
        <MiniNav />
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        {mode === "edit" ? (
          <AskPopo />
        ) : (
          <AnalyzeSelectionPanel
            selectedNodes={selectedAnalyzeNodes}
            onAnalyze={handleAnalyzeExecute}
            onClear={handleAnalyzeClear}
            onRemoveNode={handleAnalyzeRemoveNode}
          />
        )}
      </div>
      {!voiceChatVisible && (
        <div className="fixed top-4 right-4 z-50">
          <StatusBox onStartVoiceChat={() => setVoiceChatVisible(true)} shareLink={shareLink} />
        </div>
      )}
      {!voiceChatVisible ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <ModeToggleButton mode={mode} onModeChange={handleModeChange} />
        </div>
      ) : (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <VoiceChat
            users={voiceChatUsers}
            onMicToggle={(isMuted) => console.log("Mic muted:", isMuted)}
            onCallEnd={() => setVoiceChatVisible(false)}
            onOrganize={() => console.log("Organize clicked")}
            onShare={() => console.log("Share clicked")}
          />
        </div>
      )}

      {mode === "edit" && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,48rem)] px-4">
          <Textbox onAddNode={handleAddNode} />
        </div>
      )}

      {/* Cytoscape Canvas - 전체 화면 */}
      <CytoscapeCanvas
        nodes={nodes}
        mode={mode}
        analyzeSelection={analyzeSelection}
        selectedNodeId={selectedNodeId}
        onNodeSelect={setSelectedNodeId}
        onNodeUnselect={() => setSelectedNodeId(null)}
        onApplyTheme={handleApplyTheme}
        onDeleteNode={handleDeleteNode}
        onEditNode={handleEditNode}
        onNodePositionChange={handleNodePositionChange}
        onBatchNodePositionChange={handleBatchNodePositionChange}
        onCyReady={(cy) => { cyRef.current = cy; }}
        onCreateChildNode={handleCreateChildNode}
        onAnalyzeNodeToggle={handleAnalyzeNodeToggle}
        detachedSelectionMap={detachedSelectionMap}
        onKeepChildrenDelete={handleKeepChildrenDelete}
        onConnectDetachedSelection={handleConnectDetachedSelection}
        onDismissDetachedSelection={handleDismissDetachedSelection}
        className="absolute inset-0"
      />
    </div>
  );
};

const MindmapPage: React.FC = () => {
  return <MindmapPageContent />;
};

export default MindmapPage;
