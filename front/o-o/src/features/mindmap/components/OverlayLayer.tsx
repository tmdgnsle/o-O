/**
 * OverlayLayer
 * - HTML overlay로 노드 UI 렌더링
 * - Cytoscape 그래프 위에 React 컴포넌트를 배치
 * - overlayVersion으로 pan/zoom/drag 시 위치 갱신 트리거
 */
import type { Core } from "cytoscape";
import NodeOverlay from "./overlays/NodeOverlay";
import type { NodeData } from "../types";

export default function OverlayLayer({
  cy,
  nodes,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  overlayVersion,
}: Readonly<{
  cy: Core | null;
  nodes: NodeData[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  overlayVersion: number;
}>) {
  const zoom = cy?.zoom() ?? 1;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cy &&
        overlayVersion >= 0 &&
        nodes.map((node) => {
          const el = cy.getElementById(node.id);
          if (!el || el.empty()) return null;
          const { x, y } = el.renderedPosition();

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
            />
          );
        })}
    </div>
  );
}