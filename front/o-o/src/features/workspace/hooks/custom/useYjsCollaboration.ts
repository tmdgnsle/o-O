// useYjsCollaboration.ts
import { useEffect, useState, useRef, type RefObject } from "react";
import * as Y from "yjs";
import type { Core } from "cytoscape";
import { createYClient, type YClient } from "./yjsClient";
import { createYMapCrud, type YMapCrud } from "./yMapCrud";
import { NODES_YMAP_KEY } from "@/constants/mindmapCollaboration";
import type { NodeData } from "../../../mindmap/types";
import { useAppSelector } from "@/store/hooks";
import { fetchWebSocketToken } from "@/services/websocketTokenService";

type UseYjsCollaborationOptions = {
  /** 이 훅을 활성화할지 여부 (페이지에 따라 on/off 가능) */
  enabled?: boolean;
  /** 인증 실패 등 더 이상 재연결 시도하면 안 되는 상황에서 호출 */
  onAuthError?: () => void;
};

/**
 * Yjs 기반 협업(마인드맵) 로직을 초기화하고 관리하는 커스텀 훅
 *
 * 기능:
 * - Yjs client + WebSocket provider 초기화 및 정리
 * - Awareness 상태 (사용자 정보 + 커서 + 채팅) 관리
 * - Cytoscape 마우스 위치를 Awareness로 브로드캐스트
 * - Y.Map CRUD 유틸 제공
 */
export function useYjsCollaboration(
  wsUrl: string,
  roomId: string,
  cyRef: RefObject<Core | null>,
  cursorColor: string,
  options: UseYjsCollaborationOptions = {}
) {
  const { enabled = true, onAuthError } = options;

  const [collab, setCollab] = useState<{ client: YClient; map: Y.Map<NodeData> } | null>(null);
  const [crud, setCrud] = useState<YMapCrud<NodeData> | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const currentUser = useAppSelector((state) => state.user.user);

  // refs
  const currentClientRef = useRef<YClient | null>(null);
  const mountedRef = useRef<boolean>(true);
  const reconnectingRef = useRef<boolean>(false);
  const statusCleanupRef = useRef<(() => void) | null>(null);
  const connectionCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef<boolean>(enabled);
  const onAuthErrorRef = useRef<(() => void) | undefined>(onAuthError);

  // enabled / onAuthError ref 동기화
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onAuthErrorRef.current = onAuthError;
  }, [onAuthError]);

  // WebSocket/Client 초기화 & 정리
  useEffect(() => {
    mountedRef.current = true;

    const clearConnectionCheckTimeout = () => {
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
        connectionCheckTimeoutRef.current = null;
      }
    };

    const cleanupClient = () => {
      if (statusCleanupRef.current) {
        statusCleanupRef.current();
        statusCleanupRef.current = null;
      }
      clearConnectionCheckTimeout();

      if (currentClientRef.current) {
        try {
          console.log("[useYjsCollaboration] cleanup: destroying client");
          currentClientRef.current.destroy();
        } catch (e) {
          console.error("[useYjsCollaboration] error destroying client:", e);
        }
        currentClientRef.current = null;
      }

      // 언마운트 이후 setState 호출 방지
      if (mountedRef.current) {
        setCollab(null);
        setCrud(null);
      }
    };

    const scheduleConnectionCheck = (client: YClient) => {
      clearConnectionCheckTimeout();
      connectionCheckTimeoutRef.current = setTimeout(() => {
        if (client.provider.wsconnected) {
          console.log("[useYjsCollaboration] WebSocket connection established");
          setConnectionError(false);
        } else {
          console.error("[useYjsCollaboration] WebSocket connection failed after 3 seconds");
          setConnectionError(true);
        }
      }, 3000);
    };

    const refreshTokenAndReconnect = async () => {
      if (
        reconnectingRef.current ||
        !mountedRef.current ||
        !currentClientRef.current ||
        !enabledRef.current
      ) {
        return;
      }

      reconnectingRef.current = true;
      try {
        console.log("[useYjsCollaboration] refreshing ws-token after disconnect");
        const nextToken = await fetchWebSocketToken();
        if (!mountedRef.current || !currentClientRef.current || !enabledRef.current) {
          return;
        }

        currentClientRef.current.wsToken = nextToken;

        const provider = currentClientRef.current.provider;
        
        provider.params = {
          token: nextToken,
        };

        provider.shouldConnect = true;
        provider.connect();
      } catch (error: any) {
        console.error("[useYjsCollaboration] failed to refresh ws-token:", error);
        setConnectionError(true);

        // 예: 401/403 등 인증 에러라면 더 이상 재시도하지 않도록 콜백 호출
        if (onAuthErrorRef.current) {
          onAuthErrorRef.current();
        }
      } finally {
        reconnectingRef.current = false;
      }
    };

    const attachStatusListener = (client: YClient) => {
      if (statusCleanupRef.current) {
        statusCleanupRef.current();
        statusCleanupRef.current = null;
      }

      const handleStatus = (event: { status: "connected" | "disconnected" | "connecting" }) => {
        console.log("[useYjsCollaboration] provider status:", event.status);
        if (!enabledRef.current) return;

        if (event.status === "disconnected") {
          // 여기서 바로 새 ST 받아서 재연결 시도
          refreshTokenAndReconnect();
        } else if (event.status === "connected") {
          setConnectionError(false);
        }
      };

      client.provider.on("status", handleStatus);
      statusCleanupRef.current = () => {
        client.provider.off("status", handleStatus);
      };
    };

    const initializeClient = async () => {
      if (!enabled) {
        console.log("[useYjsCollaboration] not enabled, skip initialize");
        return;
      }

      try {
        console.log("[useYjsCollaboration] fetching initial ws-token");
        const token = await fetchWebSocketToken();
        if (!mountedRef.current || !token || !enabledRef.current) return;

        console.log("[useYjsCollaboration] initializing YClient with workspace:", roomId);
        const client = createYClient(wsUrl, roomId, token);
        const map = client.doc.getMap<NodeData>(NODES_YMAP_KEY);

        if (!mountedRef.current || !enabledRef.current) {
          client.destroy();
          return;
        }

        currentClientRef.current = client;

        setCollab({ client, map });
        const crudOps = createYMapCrud(client.doc, map);
        setCrud(crudOps);
        setConnectionError(false);

        attachStatusListener(client);


        // ⭐⭐⭐ 여기 붙여!!! ⭐⭐⭐
        client.provider.on("connection-close", (event: any) => {
          console.log(
            "🧯 [y-websocket] connection-close",
            "code =", event?.evt?.code,
            "reason =", event?.evt?.reason
          );
        });
        // ————————————————————————————————

        scheduleConnectionCheck(client);

        console.log("[useYjsCollaboration] YClient initialized");
      } catch (error: any) {
        console.error("[useYjsCollaboration] failed to initialize YClient:", error);
        setConnectionError(true);
        cleanupClient();

        // 초기 ST 발급 자체가 인증 에러라면 여기서도 onAuthError 호출
        if (onAuthErrorRef.current) {
          onAuthErrorRef.current();
        }
      }
    };

    // 🔑 enabled === false면 기존 연결을 정리하고 아무 것도 하지 않음
    if (enabled) {
      initializeClient();
    } else {
      cleanupClient();
    }

    // Cleanup
    return () => {
      cleanupClient();
      mountedRef.current = false;
    };
  }, [roomId, wsUrl, enabled]);

  // Awareness 초기화 (사용자 정보 + 기본 커서/채팅 상태)
  useEffect(() => {
    if (!collab) return;

    const awareness = collab.client.provider.awareness;
    if (!awareness) return;

    const setAwarenessState = () => {
      const initialState = {
        user: {
          name: currentUser?.nickname || "익명의 사용자",
          email: currentUser?.email || "",
          profileImage: currentUser?.profileImage,
          color: cursorColor,
        },
        cursor: null, // mousemove에서 갱신
        chat: null, // 채팅 입력 시 갱신
      };
      console.log("[useYjsCollaboration] set initial awareness state:", initialState);
      awareness.setLocalState(initialState);
    };

    if (collab.client.provider.wsconnected) {
      setAwarenessState();
    } else {
      const handleStatus = (event: { status: string }) => {
        if (event.status === "connected") {
          setAwarenessState();
          collab.client.provider.off("status", handleStatus);
        }
      };
      collab.client.provider.on("status", handleStatus);

      return () => {
        collab.client.provider.off("status", handleStatus);
      };
    }

    return () => {
      awareness.setLocalState(null);
    };
  }, [collab, cursorColor, currentUser]);

  // Cytoscape 마우스 위치 → awareness.cursor 브로드캐스트
  // useEffect(() => {
  //   if (!collab) return;
  //   const cy = cyRef.current;
  //   if (!cy) return;

  //   const awareness = collab.client.provider.awareness;
  //   if (!awareness) return;

  //   let raf = 0;
  //   let lastLog = 0;

  //   const handleMouseMove = (event: cytoscape.EventObject) => {
  //     if (raf) cancelAnimationFrame(raf);

  //     raf = requestAnimationFrame(() => {
  //       const position = event.position;
  //       if (!position) return;

  //       const cursorData = {
  //         x: position.x, // model 좌표 (pan/zoom 영향 없음)
  //         y: position.y,
  //         color: cursorColor,
  //       };

  //       if (Date.now() - lastLog > 5000) {
  //         console.log("[useYjsCollaboration] set cursor (model coords):", cursorData);
  //         lastLog = Date.now();
  //       }

  //       awareness.setLocalStateField("cursor", cursorData);
  //     });
  //   };

  //   console.log("[useYjsCollaboration] attach mousemove to Cytoscape");
  //   cy.on("mousemove", handleMouseMove);

  //   return () => {
  //     cy.off("mousemove", handleMouseMove);
  //     if (raf) cancelAnimationFrame(raf);
  //   };
  // }, [collab, cyRef, cursorColor]);

  // 채팅 상태 업데이트 메서드
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
