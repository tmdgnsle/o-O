// 좌표 변환/렌더 타이밍/포인터 이벤트를 한 군데로 모아 관리 편의 + 성능을 챙기는 레이어
import type { Core } from "cytoscape";
import NodeOverlay from "./overlays/NodeOverlay";
import type { NodeData } from "../types";

export default function OverlayLayer({
  cy, nodes, selectedNodeId, onNodeSelect, onNodeUnselect, onApplyTheme,
}: Readonly <{
  cy: Core | null;
  nodes: NodeData[];
  selectedNodeId?: string;
  onNodeSelect: (id: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
}>) {
  const zoom = cy?.zoom() ?? 1;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cy &&
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