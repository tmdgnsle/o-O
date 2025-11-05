import { useEffect, useMemo, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type cytoscape from "cytoscape";
import type { Core } from "cytoscape";
import type { NodeData } from "@/features/mindmap/pages/MindmapPage";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import RadialToolGroup from "./RadialToolGroup";
import RecommendNodeOverlay from "./RecommendNodeOverlay";
import AddInputBox from "./AddInputBox";
import { useNodeTextEdit } from "../hooks/custom/useNodeTextEdit";
import { useNodeAdd } from "../hooks/custom/useNodeAdd";
import { useNodeColorEdit } from "../hooks/custom/useNodeColorEdit";
import { useNodeFocus } from "../hooks/custom/useNodeFocus";
import { useNodeZIndex } from "../hooks/custom/useNodeZIndex";
import { useNodeHandlers } from "../hooks/custom/useNodeHandlers";
import {
  useDeleteNode,
  useEditNode,
  useAddNode,
} from "../hooks/mutation/useNodeMutations";
import { getContrastTextColor } from "@/shared/utils/colorUtils";

type CytoscapeCanvasProps = {
  nodes: NodeData[];
  className?: string;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
};

export default function CytoscapeCanvas({
  nodes,
  className,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onNodePositionChange,
}: CytoscapeCanvasProps) {
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setRenderTrigger] = useState(0); // 드래그 중 리렌더 트리거용

  // edges 계산 (parentId 기반)
  const edges = useMemo(() => {
    return nodes
      .filter(node => node.parentId)
      .map(node => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId!,
        target: node.id,
      }));
  }, [nodes]);

  // Cytoscape 노드는 투명하게 (드래그/선택 기능만 사용)
  const stylesheet = useMemo(
    () => [
      {
        selector: "node",
        style: {
          width: 224, // w-56 = 14rem = 224px
          height: 224,
          "background-color": "transparent",
          "background-opacity": 0,
          "border-width": 0,
          label: "",
          "overlay-opacity": 0,
        },
      },
      {
        selector: "node:selected",
        style: {
          "border-width": 0,
          "overlay-opacity": 0,
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#D1D5DB", // gray-300
          "target-arrow-color": "#D1D5DB",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "control-point-step-size": 40,
        },
      },
      {
        selector: "edge:selected",
        style: {
          "line-color": "#4876FF",
          "target-arrow-color": "#4876FF",
          width: 4,
        },
      },
    ],
    []
  );

  // Cytoscape 이벤트 핸들러 설정
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleSelect = (event: cytoscape.EventObject) => {
      onNodeSelect(event.target.id());
    };

    const handleUnselect = () => {
      onNodeUnselect();
    };

    const handleDragFree = (event: cytoscape.EventObject) => {
      const node = event.target;
      const pos = node.position();
      onNodePositionChange?.(node.id(), pos.x, pos.y);
    };

    cy.on("select", "node", handleSelect);
    cy.on("unselect", "node", handleUnselect);
    cy.on("dragfree", "node", handleDragFree);

    return () => {
      cy.off("select", "node", handleSelect);
      cy.off("unselect", "node", handleUnselect);
      cy.off("dragfree", "node", handleDragFree);
    };
  }, [onNodeSelect, onNodeUnselect, onNodePositionChange]);

  // Cytoscape 인스턴스 초기화 (한 번만)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // 스타일 적용
    cy.style(stylesheet as any);
  }, [stylesheet]);

  // nodes/edges 변경 시 diff 업데이트
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    let hasChanges = false;

    cy.batch(() => {
      // 기존 노드/엣지 ID 목록
      const existingNodeIds = new Set(cy.nodes().map(n => n.id()));
      const existingEdgeIds = new Set(cy.edges().map(e => e.id()));

      // 새로운 노드 추가 또는 업데이트
      nodes.forEach(node => {
        if (existingNodeIds.has(node.id)) {
          // 기존 노드 업데이트 (위치, 색상, 텍스트)
          const cyNode = cy.getElementById(node.id);
          cyNode.position({ x: node.x, y: node.y });
          cyNode.data({ label: node.text, color: node.color });
        } else {
          // 새 노드 추가
          cy.add({
            group: 'nodes',
            data: {
              id: node.id,
              label: node.text,
              color: node.color,
            },
            position: { x: node.x, y: node.y },
          });
          hasChanges = true;
        }
      });

      // 삭제된 노드 제거
      const newNodeIds = new Set(nodes.map(n => n.id));
      existingNodeIds.forEach(id => {
        if (!newNodeIds.has(id)) {
          cy.getElementById(id).remove();
          hasChanges = true;
        }
      });

      // 새로운 엣지 추가
      edges.forEach(edge => {
        if (!existingEdgeIds.has(edge.id)) {
          cy.add({
            group: 'edges',
            data: {
              id: edge.id,
              source: edge.source,
              target: edge.target,
            },
          });
          hasChanges = true;
        }
      });

      // 삭제된 엣지 제거
      const newEdgeIds = new Set(edges.map(e => e.id));
      existingEdgeIds.forEach(id => {
        if (!newEdgeIds.has(id)) {
          cy.getElementById(id).remove();
          hasChanges = true;
        }
      });
    });

    // 변경사항이 있으면 overlay 리렌더링 트리거
    if (hasChanges) {
      setRenderTrigger(prev => prev + 1);
    }
  }, [nodes, edges]);

  // 드래그 중 실시간 overlay 업데이트
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    let animationFrameId: number;

    const handleDrag = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        setRenderTrigger(prev => prev + 1);
      });
    };

    cy.on("drag", "node", handleDrag);

    return () => {
      cy.off("drag", "node", handleDrag);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className={cn("relative h-full w-full", className)} ref={containerRef}>
      {/* Cytoscape 캔버스 (투명 노드, 드래그/선택 기능만) */}
      <CytoscapeComponent
        elements={[]} // 초기에만 빈 배열, 이후 useEffect로 diff 업데이트
        stylesheet={stylesheet}
        layout={{ name: "preset" }}
        cy={(instance) => {
          cyRef.current = instance;
        }}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0"
      />

      {/* HTML Overlay - TempNode UI */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((node) => {
          const cy = cyRef.current;
          if (!cy) return null;

          const cyNode = cy.getElementById(node.id);
          if (!cyNode || cyNode.length === 0) return null;

          const renderedPos = cyNode.renderedPosition();

          return (
            <CytoscapeNodeOverlay
              key={node.id}
              node={node}
              x={renderedPos.x}
              y={renderedPos.y}
              isSelected={selectedNodeId === node.id}
              onSelect={() => onNodeSelect(node.id)}
              onDeselect={onNodeUnselect}
              onApplyTheme={onApplyTheme}
            />
          );
        })}
      </div>
    </div>
  );
}

// TempNode의 UI를 Cytoscape overlay로 렌더링하는 컴포넌트
type CytoscapeNodeOverlayProps = {
  node: NodeData;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onApplyTheme: (colors: string[]) => void;
};

function CytoscapeNodeOverlay({
  node,
  x,
  y,
  isSelected,
  onSelect,
  onDeselect,
  onApplyTheme,
}: CytoscapeNodeOverlayProps) {
  const { id, text, color: initialColor } = node;

  // Mutation hooks
  const deleteNodeMutation = useDeleteNode();
  const editNodeMutation = useEditNode();
  const addNodeMutation = useAddNode();

  // Custom hooks
  const {
    isEditing,
    editValue,
    setEditValue,
    startEdit,
    cancelEdit,
    confirmEdit,
  } = useNodeTextEdit(text);

  const { showAddInput, openAddInput, closeAddInput } = useNodeAdd();

  const { paletteOpen, togglePalette, closePalette } = useNodeColorEdit(initialColor);

  const { focusedButton, setFocusedButton } = useNodeFocus();

  const {
    handleClick,
    handleDelete,
    handleEdit,
    handleEditCancel,
    handleEditConfirm,
    handleAdd,
    handleAddCancel,
    handleAddConfirm,
    handlePalette,
    handleColorChange,
    handlePaletteClose,
    handleRecommend,
    handleRecommendSelect,
  } = useNodeHandlers({
    id,
    x: node.x,
    y: node.y,
    initialColor,
    isSelected,
    onSelect,
    onDeselect,
    setFocusedButton,
    deleteNodeMutation,
    editNodeMutation,
    addNodeMutation,
    startEdit,
    cancelEdit,
    confirmEdit,
    openAddInput,
    closeAddInput,
    togglePalette,
    closePalette,
    paletteOpen,
  });

  const zIndex = useNodeZIndex({ focusedButton, isSelected });

  const textColor = getContrastTextColor(initialColor);

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        zIndex,
      }}
    >
      {/* 노드 원 */}
      <div
        onClick={handleClick}
        className={`w-56 h-56 rounded-full flex items-center justify-center cursor-pointer transition-all ${
          isSelected ? "ring-4 ring-primary/30" : ""
        }`}
        style={{ backgroundColor: initialColor }}
      >
        {isEditing ? (
          <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-32 h-10 text-sm text-center bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditConfirm();
                if (e.key === "Escape") handleEditCancel();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEditConfirm}
                className="bg-green-500 hover:bg-green-600 h-8 px-3"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditCancel}
                className="h-8 px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <span
            className="font-paperlogy font-semibold text-lg px-6 text-center break-words"
            style={{ color: textColor }}
          >
            {text}
          </span>
        )}
      </div>

      {/* Radial Tool Group */}
      <RadialToolGroup
        open={isSelected && !isEditing && focusedButton !== "recommend"}
        paletteOpen={paletteOpen}
        currentColor={initialColor}
        focusedButton={focusedButton}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAdd={handleAdd}
        onPalette={handlePalette}
        onPaletteClose={handlePaletteClose}
        onRecommend={handleRecommend}
        onColorChange={handleColorChange}
        onApplyTheme={onApplyTheme}
      />

      {/* Add Child Input */}
      {showAddInput && (
        <AddInputBox onConfirm={handleAddConfirm} onCancel={handleAddCancel} />
      )}

      {/* Recommendation Overlay */}
      {focusedButton === "recommend" && (
        <RecommendNodeOverlay
          open={focusedButton === "recommend"}
          onClose={() => setFocusedButton(null)}
          onSelectRecommendation={handleRecommendSelect}
        />
      )}
    </div>
  );
}