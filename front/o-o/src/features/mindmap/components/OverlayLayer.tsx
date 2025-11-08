/**
 * OverlayLayer
 * - HTML overlay로 노드 UI 렌더링
 * - Cytoscape 그래프 위에 React 컴포넌트를 배치
 * - overlayVersion으로 pan/zoom/drag 시 위치 갱신 트리거
 */
import type { Core } from "cytoscape";
import NodeOverlay from "./overlays/NodeOverlay";
import type { NodeData, ChildNodeRequest } from "../types";

export default function OverlayLayer({
  cy,
  nodes,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onCreateChildNode,
}: Readonly<{
  cy: Core | null;
  nodes: NodeData[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onCreateChildNode: (request: ChildNodeRequest) => void;
}>) {
  const zoom = cy?.zoom() ?? 1;
  const container = cy?.container() ?? null;
  const viewportWidth = container?.clientWidth ?? null;
  const viewportHeight = container?.clientHeight ?? null;
  const OVERSCAN_PX = 200; // render nodes slightly outside viewport to avoid pop-in

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cy &&
        nodes.map((node) => {
          const el = cy.getElementById(node.id);
          if (!el || el.empty()) return null;

          const { x, y } = el.renderedPosition();
          if (
            viewportWidth !== null &&
            viewportHeight !== null &&
            (x < -OVERSCAN_PX ||
              x > viewportWidth + OVERSCAN_PX ||
              y < -OVERSCAN_PX ||
              y > viewportHeight + OVERSCAN_PX)
          ) {
            return null;
          }

          return (
            <NodeOverlay
              key={node.id}
              node={node}
              x={x}
              y={y}
              zoom={zoom}
              isSelected={selectedNodeId === node.id}
              onSelect={() => onNodeSelect(node.id)}
              onDeselect={onNodeUnselect}
              onApplyTheme={onApplyTheme}
              onCreateChildNode={onCreateChildNode}
            />
          );
        })}
    </div>
  );
}
