import { useEffect, useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { fetchMindmapNodes } from "@/services/mindmapService";
import { useYMapState } from "./useYMapState";
import type { NodeData } from "../../../mindmap/types";
import type { YClient } from "./yjsClient";

/**
 * 협업 노드 상태 관리 및 REST 부트스트랩 훅
 *
 * **주요 기능:**
 * - Y.Map과 동기화된 노드 상태를 React state로 관리
 * - 워크스페이스당 1회만 REST API에서 초기 데이터 로드 (부트스트랩)
 * - 부트스트랩 진행 상태 추적
 *
 * **부트스트랩 로직:**
 * 1. Y.Map이 비어있고, 아직 부트스트랩하지 않았으면 REST API 호출
 * 2. 받아온 노드들을 Y.Map에 transaction으로 한 번에 추가
 * 3. 워크스페이스 변경 시 부트스트랩 가드 리셋
 *
 * @param collab - Yjs client + map 객체 (null이면 아직 초기화 전)
 * @param workspaceId - 현재 워크스페이스 ID
 * @returns {object} nodes (배열), nodesState (Record), isBootstrapping (boolean)
 */
export function useCollaborativeNodes(
  collab: { client: YClient; map: Y.Map<NodeData> } | null,
  workspaceId: string
) {
  // Prevents duplicate REST bootstraps per workspace
  const hasBootstrappedRef = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Reset bootstrap guard whenever the workspace changes
  useEffect(() => {
    hasBootstrappedRef.current = false;
  }, [workspaceId]);

  // Seed the collaborative document with REST data exactly once
  useEffect(() => {
    if (!collab || hasBootstrappedRef.current) {
      return;
    }

    // If the map already has data (from other peers), skip bootstrap
    if (collab.map.size > 0) {
      hasBootstrappedRef.current = true;
      return;
    }

    hasBootstrappedRef.current = true;
    setIsBootstrapping(true);
    let cancelled = false;

    const run = async () => {
      try {
        console.time('[useCollaborativeNodes] fetchMindmapNodes');
        const restNodes = await fetchMindmapNodes(workspaceId);
        console.timeEnd('[useCollaborativeNodes] fetchMindmapNodes');

        if (cancelled || restNodes.length === 0) {
          setIsBootstrapping(false);
          return;
        }

        // Use transaction to batch all insertions for performance
        console.time('[useCollaborativeNodes] Y.Map transaction');
        collab.client.doc.transact(() => {
          for (const node of restNodes) {
            if (!collab.map.has(node.id)) {
              collab.map.set(node.id, node);
            }
          }
        }, "mindmap-bootstrap");
        console.timeEnd('[useCollaborativeNodes] Y.Map transaction');

        console.log(`✅ [useCollaborativeNodes] Bootstrapped ${restNodes.length} nodes`);
        setIsBootstrapping(false);
      } catch (error) {
        if (!cancelled) {
          hasBootstrappedRef.current = false;
          setIsBootstrapping(false);
          console.error("[useCollaborativeNodes] Failed to bootstrap nodes:", error);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [collab, workspaceId]);

  // Sync Y.Map state to React state
  const nodesState = useYMapState<NodeData>(collab?.map);
  const nodes = useMemo<NodeData[]>(() => Object.values(nodesState), [nodesState]);

  return {
    nodes,
    nodesState,
    isBootstrapping,
  };
}
