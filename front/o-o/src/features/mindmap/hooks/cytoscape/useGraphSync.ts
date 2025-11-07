import { useEffect, useMemo } from "react";
import type { Core } from "cytoscape";
import type { NodeData } from "../../types";

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
function upsertNode(cy: Core, node: NodeData, existingNodeIds: Set<string>) {
  if (existingNodeIds.has(node.id)) {
    // 기존 노드 업데이트
    const cyNode = cy.getElementById(node.id);
    const pos = cyNode.position();

    if (pos.x !== node.x || pos.y !== node.y) {
      cyNode.position({ x: node.x, y: node.y });
    }

    cyNode.data({ label: node.text, color: node.color });
    cyNode.grabify();
    cyNode.selectify();
  } else {
    // 새 노드 추가
    cy.add({
      group: "nodes",
      data: { id: node.id, label: node.text, color: node.color },
      position: { x: node.x, y: node.y },
      grabbable: true,
      selectable: true,
    });
  }
}

/** 삭제된 노드 제거 */
function removeDeletedNodes(cy: Core, existingNodeIds: Set<string>, newNodeIds: Set<string>) {
  for (const id of existingNodeIds) {
    if (!newNodeIds.has(id)) {
      cy.getElementById(id).remove();
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
          upsertNode(cy, node, existingNodeIds);
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
  }, [cy, cyReady, nodes, edges]);
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
