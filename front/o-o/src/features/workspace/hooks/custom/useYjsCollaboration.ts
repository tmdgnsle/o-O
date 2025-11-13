import { useEffect, useState, useRef, type RefObject } from "react";
import * as Y from "yjs";
import type { Core } from "cytoscape";
import { createYClient, type YClient } from "./yjsClient";
import { createYMapCrud, type YMapCrud } from "./yMapCrud";
import { NODES_YMAP_KEY } from "@/constants/mindmapCollaboration";
import type { NodeData } from "../../../mindmap/types";
import { useAppSelector } from "@/store/hooks";
import { fetchWebSocketToken } from "@/services/websocketTokenService";

/**
 * Yjs 협업 로직을 관리하는 커스텀 훅
 *
 * **주요 기능:**
 * - Yjs client 및 WebSocket provider 초기화
 * - Awareness 상태 설정 (사용자 정보 + 커서)
 * - Cytoscape 캔버스 상의 마우스 움직임을 실시간 브로드캐스트
 * - Y.Map CRUD 작업 래퍼 제공
 *
 * @param wsUrl - WebSocket 서버 URL
 * @param roomId - 협업 룸 ID (workspace 기반)
 * @param cyRef - Cytoscape 인스턴스 참조 (커서 좌표 추적용)
 * @param cursorColor - 사용자의 고유 커서 색상
 * @returns {object} collab (client + map), crud 작업, cursorColor, 에러 상태
 */
export function useYjsCollaboration(
  wsUrl: string,
  roomId: string,
  cyRef: RefObject<Core | null>,
  cursorColor: string
) {
  const [collab, setCollab] = useState<{ client: YClient; map: Y.Map<NodeData> } | null>(null);
  const [crud, setCrud] = useState<YMapCrud<NodeData> | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const currentUser = useAppSelector((state) => state.user.user);

  // Store current client ref for cleanup
  const currentClientRef = useRef<YClient | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Initialize client with token
  useEffect(() => {
    mountedRef.current = true;
    let connectionCheckTimeout: ReturnType<typeof setTimeout> | null = null;

    const initializeClient = async () => {
      try {
        // Fetch initial token
        console.log("🔑 Fetching ws-token");
        const token = await fetchWebSocketToken();
        if (!mountedRef.current || !token) return;

        // Create client
        console.log("🚀 Initializing YClient with workspace:", roomId);
        const client = createYClient(wsUrl, roomId, token);
        const map = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

        if (!mountedRef.current) {
          client.destroy();
          return;
        }

        // Store in ref for cleanup
        currentClientRef.current = client;

        setCollab({ client, map });
        const crudOps = createYMapCrud(client.doc, map);
        setCrud(crudOps);

        // Check connection status after 3 seconds
        connectionCheckTimeout = setTimeout(() => {
          if (!client.provider.wsconnected) {
            console.error("❌ WebSocket connection failed after 3 seconds");
            setConnectionError(true);
            // Immediately destroy provider to stop retry attempts
            if (currentClientRef.current) {
              console.log("🧹 Destroying failed connection");
              currentClientRef.current.provider.destroy();
              currentClientRef.current = null;
            }
          } else {
            console.log("✅ WebSocket connection established");
          }
        }, 3000);

        console.log("✅ YClient initialized");
      } catch (error) {
        console.error("❌ Failed to initialize YClient:", error);
        setConnectionError(true);
        // Cleanup on error
        if (currentClientRef.current) {
          currentClientRef.current.provider.destroy();
          currentClientRef.current = null;
        }
      }
    };

    initializeClient();

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (connectionCheckTimeout) {
        clearTimeout(connectionCheckTimeout);
      }

      // Destroy client using ref
      if (currentClientRef.current) {
        try {
          console.log("🧹 Cleanup: Destroying client");
          currentClientRef.current.provider.destroy();
          currentClientRef.current = null;
        } catch (e) {
          console.error("Error destroying client:", e);
        }
      }

      setCollab(null);
      setCrud(null);
    };
  }, [roomId, wsUrl]);

  // Initialize awareness state (user info + cursor placeholder)
  useEffect(() => {
    if (!collab) return;

    const awareness = collab.client.provider.awareness;
    if (!awareness) return;

    // Wait for connection before setting awareness
    const setAwarenessState = () => {
      const initialState = {
        user: {
          name: currentUser?.nickname || "Anonymous",
          email: currentUser?.email || "",
          profileImage: currentUser?.profileImage,
          color: cursorColor,
        },
        cursor: null, // Will be updated by mousemove
        chat: null, // Will be updated when user types
      };
      console.log("🎨 [useYjsCollaboration] Setting initial awareness state:", initialState);
      awareness.setLocalState(initialState);
    };

    // Check if already connected
    if (collab.client.provider.wsconnected) {
      setAwarenessState();
    } else {
      // Wait for connection
      const handleStatus = (event: { status: string }) => {
        if (event.status === "connected") {
          setAwarenessState();
          collab.client.provider.off("status", handleStatus);
        }
      };
      collab.client.provider.on("status", handleStatus);

      // Cleanup listener if component unmounts before connection
      return () => {
        collab.client.provider.off("status", handleStatus);
      };
    }

    return () => {
      if (awareness) {
        awareness.setLocalState(null);
      }
    };
  }, [collab, cursorColor, currentUser]);

  // Broadcast cursor position when Cytoscape is ready
  useEffect(() => {
    if (!collab) return;
    const cy = cyRef.current;
    if (!cy) return;

    const awareness = collab.client.provider.awareness;
    if (!awareness) return;

    let raf = 0;
    let lastLog = 0;

    // Use Cytoscape mousemove event to get model coordinates (not viewport-relative)
    const handleMouseMove = (event: cytoscape.EventObject) => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      raf = requestAnimationFrame(() => {
        const position = event.position;
        if (!position) return;

        const cursorData = {
          x: position.x, // Model coordinates (absolute, pan/zoom-independent)
          y: position.y,
          color: cursorColor,
        };

        // Log throttled to avoid console spam
        if (Date.now() - lastLog > 5000) {
          console.log("🖱️ [useYjsCollaboration] Setting cursor (model coords):", cursorData);
          lastLog = Date.now();
        }

        awareness.setLocalStateField("cursor", cursorData);
      });
    };

    console.log("🎮 [useYjsCollaboration] Attaching mousemove to Cytoscape");
    cy.on("mousemove", handleMouseMove);

    return () => {
      cy.off("mousemove", handleMouseMove);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [collab, cyRef.current, cursorColor]);

  // Method to update chat awareness state
  const updateChatState = (
    chatData: { isTyping: boolean; currentText: string; timestamp: number } | null
  ) => {
    if (!collab) return;
    const awareness = collab.client.provider.awareness;
    if (!awareness) return;
    awareness.setLocalStateField("chat", chatData);
  };

  return {
    collab,
    crud,
    cursorColor,
    updateChatState,
    connectionError,
  };
}
