import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { NodeData } from "../../types";
import {
  createMindmapNode,
  updateMindmapNode,
  deleteMindmapNode,
} from "@/services/mindmapService";

/**
 * Yjs Y.Map 변경사항을 백엔드 API와 동기화하는 훅
 *
 * **동작 방식:**
 * 1. Y.Map에 observe 리스너 등록
 * 2. 로컬 변경(add/update/delete) 감지
 * 3. 해당 변경사항을 백엔드 API로 전송
 * 4. 원격 변경(다른 사용자)은 무시 (이미 Yjs가 동기화함)
 *
 * **주의사항:**
 * - transaction.origin이 'mindmap-crud'인 경우만 처리 (로컬 변경)
 * - 네트워크 오류 시 재시도 로직 없음 (추후 개선 가능)
 */
export function useMindmapSync(
  workspaceId: string,
  yMap: Y.Map<NodeData> | null,
  enabled: boolean = true
) {
  const syncInProgressRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!yMap || !enabled) return;

    const handleYMapChange = (
      event: Y.YMapEvent<NodeData>,
      transaction: Y.Transaction
    ) => {
      // 원격 변경은 무시 (이미 동기화됨)
      if (transaction.origin !== "mindmap-crud") {
        return;
      }

      console.log("[useMindmapSync] Y.Map changed:", {
        added: Array.from(event.keysChanged),
        origin: transaction.origin,
      });

      // 변경된 각 노드에 대해 백엔드 동기화
      event.keysChanged.forEach((key) => {
        const action = event.changes.keys.get(key);
        if (!action) return;

        // 중복 요청 방지
        if (syncInProgressRef.current.has(key)) {
          console.log("[useMindmapSync] sync already in progress for", key);
          return;
        }

        syncInProgressRef.current.add(key);

        if (action.action === "add") {
          // 새 노드 생성
          const nodeData = yMap.get(key);
          if (!nodeData) {
            syncInProgressRef.current.delete(key);
            return;
          }

          console.log("[useMindmapSync] creating node", key, nodeData);

          createMindmapNode(workspaceId, {
            parentId: nodeData.parentId ? Number(nodeData.parentId) : null,
            type: nodeData.type || "text",
            keyword: nodeData.text,
            memo: nodeData.memo,
            x: nodeData.x,
            y: nodeData.y,
            color: nodeData.color,
          })
            .then((createdNode) => {
              console.log("[useMindmapSync] node created:", createdNode);

              // 백엔드에서 받은 nodeId를 로컬 노드에 반영 (조용히)
              yMap.doc?.transact(() => {
                const current = yMap.get(key);
                if (current && createdNode.nodeId) {
                  // 백엔드 nodeId 저장 (나중에 update/delete에 사용)
                  yMap.set(key, { ...current, nodeId: createdNode.nodeId });
                }
              }, "remote");
            })
            .catch((error) => {
              console.error("[useMindmapSync] failed to create node:", error);
            })
            .finally(() => {
              syncInProgressRef.current.delete(key);
            });
        } else if (action.action === "update") {
          // 노드 수정
          const nodeData = yMap.get(key);
          if (!nodeData) {
            syncInProgressRef.current.delete(key);
            return;
          }

          // nodeId가 없으면 아직 백엔드에 생성되지 않은 노드
          if (!nodeData.nodeId) {
            console.log("[useMindmapSync] skip update - no nodeId yet", key);
            syncInProgressRef.current.delete(key);
            return;
          }

          console.log("[useMindmapSync] updating node", nodeData.nodeId, nodeData);

          updateMindmapNode(workspaceId, nodeData.nodeId, {
            keyword: nodeData.text,
            memo: nodeData.memo,
            x: nodeData.x,
            y: nodeData.y,
            color: nodeData.color,
            parentId: nodeData.parentId ? Number(nodeData.parentId) : null,
            type: nodeData.type,
            analysisStatus: nodeData.analysisStatus,
          })
            .then((updatedNode) => {
              console.log("[useMindmapSync] node updated:", updatedNode);
            })
            .catch((error) => {
              console.error("[useMindmapSync] failed to update node:", error);
            })
            .finally(() => {
              syncInProgressRef.current.delete(key);
            });
        } else if (action.action === "delete") {
          // 노드 삭제
          const oldNodeData = action.oldValue as NodeData | undefined;
          if (!oldNodeData?.nodeId) {
            console.log("[useMindmapSync] skip delete - no nodeId", key);
            syncInProgressRef.current.delete(key);
            return;
          }

          console.log("[useMindmapSync] deleting node", oldNodeData.nodeId);

          deleteMindmapNode(workspaceId, oldNodeData.nodeId)
            .then(() => {
              console.log("[useMindmapSync] node deleted:", oldNodeData.nodeId);
            })
            .catch((error) => {
              console.error("[useMindmapSync] failed to delete node:", error);
            })
            .finally(() => {
              syncInProgressRef.current.delete(key);
            });
        }
      });
    };

    console.log("[useMindmapSync] attaching observer to Y.Map");
    yMap.observe(handleYMapChange);

    return () => {
      console.log("[useMindmapSync] detaching observer from Y.Map");
      yMap.unobserve(handleYMapChange);
    };
  }, [yMap, workspaceId, enabled]);
}
