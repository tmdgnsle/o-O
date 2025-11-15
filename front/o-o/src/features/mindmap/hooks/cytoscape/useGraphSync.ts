import { useEffect, useMemo } from "react";
import type { Core } from "cytoscape";
import type { NodeData, MindmapMode } from "../../types";
import { getAnimationConfig, nodeCreationAnimation } from "../../config/animationConfig";

/** 노드 데이터를 기반으로 엣지 계산 */
export function useEdges(nodes: NodeData[]) {
  return useMemo(() => {
    const out: Array<{ id: string; source: string; target: string }> = [];
    for (const node of nodes) {
      if (node.parentId) {
        out.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
        });
      }
    }
    return out;
  }, [nodes]);
}

/** 노드 업데이트 또는 추가 */
function upsertNode(cy: Core, node: NodeData, existingNodeIds: Set<string>, mode: MindmapMode) {
  const isDraggable = mode === "edit";

  if (existingNodeIds.has(node.id)) {
    // 기존 노드 업데이트
    const cyNode = cy.getElementById(node.id);
    const pos = cyNode.position();

    if (pos.x !== node.x || pos.y !== node.y) {
      cyNode.position({ x: node.x, y: node.y });
    }

    cyNode.data({ label: node.keyword, color: node.color });

    // 모드에 따라 드래그 가능 여부 설정
    if (isDraggable) {
      cyNode.grabify();
    } else {
      cyNode.ungrabify();
    }
    cyNode.selectify();
  } else {
    // 새 노드 추가
    const newNode = cy.add({
      group: "nodes",
      data: { id: node.id, label: node.keyword, color: node.color },
      position: { x: node.x, y: node.y },
      grabbable: isDraggable,
      selectable: true,
    });

    // 애니메이션: 초기 상태 설정
    newNode.style({
      opacity: nodeCreationAnimation.initialStyle.opacity,
      width: nodeCreationAnimation.initialStyle.width,
      height: nodeCreationAnimation.initialStyle.height,
    });

    // 애니메이션: fade + scale 효과
    const config = getAnimationConfig();
    newNode.animate(
      {
        style: {
          opacity: nodeCreationAnimation.targetStyle.opacity,
          width: nodeCreationAnimation.targetStyle.width,
          height: nodeCreationAnimation.targetStyle.height,
        },
        duration: config.nodeCreation.duration,
        easing: config.nodeCreation.easing,
      },
      {
        queue: false,
      }
    );
  }
}

/** 삭제된 노드 제거 */
function removeDeletedNodes(cy: Core, existingNodeIds: Set<string>, newNodeIds: Set<string>) {
  const config = getAnimationConfig();

  for (const id of existingNodeIds) {
    if (!newNodeIds.has(id)) {
      const nodeToRemove = cy.getElementById(id);

      // 애니메이션이 비활성화된 경우 즉시 제거
      if (config.nodeDeletion.duration === 0) {
        nodeToRemove.remove();
      } else {
        // 애니메이션: shrink + fade 효과
        nodeToRemove.animate(
          {
            style: {
              opacity: 0,
              width: 0,
              height: 0,
            },
            duration: config.nodeDeletion.duration,
            easing: config.nodeDeletion.easing,
          },
          {
            queue: false,
            complete: () => {
              // 애니메이션 완료 후 노드 제거
              try {
                if (!cy.destroyed() && nodeToRemove.length > 0) {
                  nodeToRemove.remove();
                }
              } catch (e) {
                console.error("Error removing node after animation:", e);
              }
            },
          }
        );
      }
    }
  }
}

/** 엣지 추가 */
function addEdge(cy: Core, edge: { id: string; source: string; target: string }) {
  const srcExists = cy.getElementById(edge.source).length > 0;
  const tgtExists = cy.getElementById(edge.target).length > 0;

  if (srcExists && tgtExists) {
    cy.add({
      group: "edges",
      data: { id: edge.id, source: edge.source, target: edge.target },
      selectable: false,
    });
  }
}

/** 삭제된 엣지 제거 */
function removeDeletedEdges(cy: Core, existingEdgeIds: Set<string>, newEdgeIds: Set<string>) {
  for (const id of existingEdgeIds) {
    if (!newEdgeIds.has(id)) {
      cy.getElementById(id).remove();
    }
  }
}

/** Cytoscape 그래프와 React state 동기화 (diff + batch) */
export function useGraphSync(
  cy: Core | null,
  nodes: NodeData[],
  edges: Array<{ id: string; source: string; target: string }>,
  mode: MindmapMode,
  cyReady: boolean = true
) {
  useEffect(() => {
    if (!cy || !cyReady) return;

    // cy가 destroyed 상태인지 확인
    try {
      if (cy.destroyed()) return;
    } catch {
      return;
    }

    try {
      cy.batch(() => {
        // cy가 여전히 유효한지 재확인
        if (!cy || cy.destroyed()) return;

        // 현재 그래프의 노드/엣지 ID 수집
        const existingNodeIds = new Set<string>();
        const existingEdgeIds = new Set<string>();

        for (const n of cy.nodes()) existingNodeIds.add(n.id());
        for (const e of cy.edges()) existingEdgeIds.add(e.id());

        // 노드 동기화
        for (const node of nodes) {
          upsertNode(cy, node, existingNodeIds, mode);
        }

        const newNodeIds = new Set(nodes.map((n) => n.id));
        removeDeletedNodes(cy, existingNodeIds, newNodeIds);

        // 엣지 동기화
        for (const edge of edges) {
          if (!existingEdgeIds.has(edge.id)) {
            addEdge(cy, edge);
          }
        }

        const newEdgeIds = new Set(edges.map((e) => e.id));
        removeDeletedEdges(cy, existingEdgeIds, newEdgeIds);
      });
    } catch (error) {
      console.error("[useGraphSync] Error during batch update:", error);
    }
  }, [cy, cyReady, nodes, edges, mode]);
}

/** 드래그 중 오버레이 위치 갱신 (rAF 스로틀) */
export function useDragSync(
  cy: Core | null,
  onUpdate: () => void,
  cyReady: boolean = true
) {
  useEffect(() => {
    if (!cy || !cyReady) return;

    let raf: number | null = null;
    const tick = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        onUpdate();
        raf = null;
      });
    };

    cy.on("drag", "node", tick);
    cy.on("dragfree", "node", tick);

    return () => {
      cy.off("drag", "node", tick);
      cy.off("dragfree", "node", tick);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [cy, cyReady, onUpdate]);
}
