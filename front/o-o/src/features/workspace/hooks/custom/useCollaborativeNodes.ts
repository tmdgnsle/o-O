import { useEffect, useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { fetchMindmapNodes, batchUpdateNodePositions } from "@/services/mindmapService";
import { useYMapState } from "./useYMapState";
import type { NodeData } from "../../../mindmap/types";
import type { YClient } from "./yjsClient";
import { CANVAS_CENTER_X, CANVAS_CENTER_Y, clampNodePosition } from "../../../mindmap/utils/d3Utils";
import { calculateRadialLayoutWithForces } from "../../../mindmap/utils/radialLayoutWithForces";

/**
 * x, y가 null인 노드들에게 자동으로 위치를 할당
 * - calculateRadialLayoutWithForces 함수를 사용하여 방사형 레이아웃 적용 (BFS 기반)
 * - D3 Tree Layout + Force Simulation + BFS 빈 자리 찾기로 노드 겹침 방지
 */
async function calculateNodePositions(nodes: NodeData[]): Promise<NodeData[]> {
  if (nodes.length === 0) return nodes;

  // x, y가 null인 노드 확인
  const nullPositionNodes = nodes.filter(n => n.x == null || n.y == null);

  if (nullPositionNodes.length === 0) {
    // 모든 노드에 이미 좌표가 있음
    return nodes;
  }

  // 🔥 nodeId -> id 매핑 생성 (parentId는 nodeId를 참조함)
  const nodeIdToIdMap = new Map<number, string>();
  for (const node of nodes) {
    // NodeData의 nodeId가 있는지 확인 (API 응답에서 온 경우)
    const nodeIdValue = (node as any).nodeId;
    if (nodeIdValue !== undefined) {
      nodeIdToIdMap.set(Number(nodeIdValue), node.id);
    }
  }

  // parentId를 id로 변환
  const nodesForLayout = nodes.map(n => {
    let parentIdAsId: string | null = null;

    if (n.parentId) {
      const parentIdNum = Number(n.parentId);
      if (!isNaN(parentIdNum)) {
        parentIdAsId = nodeIdToIdMap.get(parentIdNum) ?? null;
      } else {
        parentIdAsId = String(n.parentId);
      }
    }

    return {
      id: n.id,
      parentId: parentIdAsId,
    };
  });

  // 방사형 레이아웃 계산 (BFS 기반 빈 자리 찾기로 노드 겹침 방지)
  const positions = await calculateRadialLayoutWithForces(nodesForLayout, CANVAS_CENTER_X, CANVAS_CENTER_Y, 350);

  // 계산된 좌표를 노드에 적용 (100px 마진으로 제한)
  const processedNodes = nodes.map(node => {
    const position = positions.find(p => p.id === node.id);

    if (position && (node.x == null || node.y == null)) {
      // 좌표를 100~4900 범위로 제한 (노드가 경계에서 잘리지 않도록)
      const clamped = clampNodePosition(position.x, position.y);

      return {
        ...node,
        x: clamped.x,
        y: clamped.y,
      };
    }

    return node;
  });

  return processedNodes;
}

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
        const restNodes = await fetchMindmapNodes(workspaceId);

        if (cancelled || restNodes.length === 0) {
          setIsBootstrapping(false);
          return;
        }

        // Calculate positions for nodes with null x/y
        const processedNodes = await calculateNodePositions(restNodes);

        // 🔥 좌표가 정규화된 노드들과 자동 계산된 노드들을 추적 (서버에 저장하기 위해)
        const nodesToUpdate = processedNodes.filter((processed, index) => {
          const original = restNodes[index];
          if (!original || processed.nodeId == null || processed.x == null || processed.y == null) {
            return false;
          }

          // 1. null 좌표가 자동 계산된 경우
          if ((original.x == null || original.y == null)) {
            return true;
          }

          // 2. 좌표가 0~5000 범위로 정규화된 경우 (_wasClamped 플래그)
          const wasClamped = (processed as any)._wasClamped === true;

          return wasClamped;
        });

        // Use transaction to batch all insertions for performance

        // 중복 제거: 같은 nodeId를 가진 노드가 이미 있으면 제거
        const existingNodeIds = new Map<number, string>();
        collab.map.forEach((node, id) => {
          if (node.nodeId) {
            existingNodeIds.set(node.nodeId as number, id);
          }
        });

        collab.client.doc.transact(() => {
          for (const node of processedNodes) {
            // 이미 같은 nodeId를 가진 노드가 Y.Map에 있는지 확인
            if (node.nodeId && existingNodeIds.has(node.nodeId as number)) {
              continue;
            }

            if (!collab.map.has(node.id)) {
              // _wasClamped 플래그 제거
              const { _wasClamped, ...cleanNode } = node as any;
              collab.map.set(cleanNode.id, cleanNode);
            }
          }
        }, "mindmap-bootstrap");

        // 정규화/자동 계산된 좌표를 서버에 저장
        if (nodesToUpdate.length > 0) {
          const positionUpdates = nodesToUpdate.map((node: NodeData) => ({
            nodeId: node.nodeId as number,
            x: node.x,
            y: node.y,
          }));

          try {
            await batchUpdateNodePositions(workspaceId, positionUpdates);
          } catch (error) {
            console.error(`[useCollaborativeNodes] Failed to save position updates:`, error);
          }
        }

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

  // 🔥 좌표가 null인 노드들을 자동으로 재계산하여 업데이트
  useEffect(() => {
    if (!collab || nodes.length === 0) return;

    const nullPositionNodes = nodes.filter(n => n.x == null || n.y == null);

    if (nullPositionNodes.length === 0) {
      // 모든 노드에 좌표가 있으면 스킵
      return;
    }

    // 전체 노드에 대해 좌표 재계산 (async)
    const updatePositions = async () => {
      const processedNodes = await calculateNodePositions(nodes);

      // 자동 계산된 좌표를 추적 (서버에 저장하기 위해)
      const updatedNodesForServer: Array<{ nodeId: number; x: number; y: number }> = [];

      // Yjs map에 업데이트
      collab.client.doc.transact(() => {
        for (const node of processedNodes) {
          if (node.x != null && node.y != null) {
            const existingNode = collab.map.get(node.id);
            if (existingNode && (existingNode.x == null || existingNode.y == null)) {
              collab.map.set(node.id, { ...existingNode, x: node.x, y: node.y });

              // nodeId가 있으면 서버 업데이트 목록에 추가
              if (existingNode.nodeId) {
                updatedNodesForServer.push({
                  nodeId: existingNode.nodeId as number,
                  x: node.x,
                  y: node.y,
                });
              }
            }
          }
        }
      }, "position-update");

      // 자동 계산된 좌표를 서버에 저장
      if (updatedNodesForServer.length > 0) {
        try {
          await batchUpdateNodePositions(workspaceId, updatedNodesForServer);
        } catch (error) {
          console.error(`[useCollaborativeNodes] 🔧 Failed to save position updates:`, error);
        }
      }
    };

    updatePositions();
  }, [collab, nodes, workspaceId]); // workspaceId 추가

  return {
    nodes,
    nodesState,
    isBootstrapping,
  };
}
