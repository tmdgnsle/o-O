/**
 * OverlayLayer
 * - HTML overlay ?? UI ??
 * - Cytoscape ??? ?? React ???? ??
 */
import type { Core } from "cytoscape";
import NodeOverlay from "./overlays/NodeOverlay";
import type { NodeData, ChildNodeRequest, MindmapMode } from "../types";

export default function OverlayLayer({
  cy,
  nodes,
  mode,
  analyzeSelection,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onCreateChildNode,
}: Readonly<{
  cy: Core | null;
  nodes: NodeData[];
  mode: MindmapMode;
  analyzeSelection: string[];
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
  const OVERSCAN_PX = 200;

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
              mode={mode}
              isAnalyzeSelected={analyzeSelection.includes(node.id)}
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
