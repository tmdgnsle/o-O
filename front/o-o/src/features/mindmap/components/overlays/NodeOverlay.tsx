import { memo } from "react";
import RadialToolGroup from "./RadialToolGroup";
import RecommendNodeOverlay from "./RecommendNodeOverlay";
import NodeEditForm from "./NodeEditForm";
import { useNodeTextEdit } from "../../hooks/custom/useNodeTextEdit";
import { useNodeAdd } from "../../hooks/custom/useNodeAdd";
import { useNodeColorEdit } from "../../hooks/custom/useNodeColorEdit";
import { useNodeFocus } from "../../hooks/custom/useNodeFocus";
import { useNodeZIndex } from "../../hooks/custom/useNodeZIndex";
import { useNodeHandlers } from "../../hooks/custom/useNodeHandlers";
import { useDeleteNode, useEditNode } from "../../hooks/mutation/useNodeMutations";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import type { CytoscapeNodeOverlayProps } from "../../types";

function NodeOverlay({
  node,
  x,
  y,
  zoom,
  mode,
  isSelected,
  isAnalyzeSelected,
  onSelect,
  onDeselect,
  onApplyTheme,
  onCreateChildNode,
}: Readonly<CytoscapeNodeOverlayProps>) {
  const { text, color: initialColor } = node;
  const isAnalyzeMode = mode === "analyze";

  const deleteNodeMutation = useDeleteNode();
  const editNodeMutation = useEditNode();

  const { isEditing, editValue, setEditValue, startEdit, cancelEdit, confirmEdit } = useNodeTextEdit(text);
  const { showAddInput, openAddInput, closeAddInput } = useNodeAdd();
  const { paletteOpen, togglePalette, closePalette } = useNodeColorEdit(initialColor);
  const { focusedButton, setFocusedButton } = useNodeFocus();

  const {
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
    id: node.id,
    x: node.x,
    y: node.y,
    initialColor,
    isSelected,
    onSelect,
    onDeselect,
    setFocusedButton,
    deleteNodeMutation,
    editNodeMutation,
    startEdit,
    cancelEdit,
    confirmEdit,
    openAddInput,
    closeAddInput,
    togglePalette,
    closePalette,
    paletteOpen,
    onCreateChildNode,
  });

  const zIndex = useNodeZIndex({ focusedButton, isSelected });
  const textColor = getContrastTextColor(initialColor);

  const selectionRingClass = isAnalyzeMode
    ? isAnalyzeSelected
      ? "ring-4 ring-emerald-400"
      : "ring-2 ring-slate-200"
    : isSelected
      ? "ring-4 ring-primary/30"
      : "";

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) scale(${zoom})`,
        zIndex,
        pointerEvents: "none",
      }}
    >
      <div
        className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ${selectionRingClass}`}
        style={{
          backgroundColor: initialColor,
          pointerEvents: "none",
        }}
      >
        {isEditing ? (
          <NodeEditForm value={editValue} onChange={setEditValue} onConfirm={handleEditConfirm} onCancel={handleEditCancel} />
        ) : (
          <span className="font-paperlogy font-semibold text-lg px-6 text-center break-words" style={{ color: textColor }}>
            {text}
          </span>
        )}
      </div>

      {!isAnalyzeMode && (
        <RadialToolGroup
          open={isSelected && !isEditing && focusedButton !== "recommend"}
          paletteOpen={paletteOpen}
          addInputOpen={showAddInput}
          currentColor={initialColor}
          focusedButton={focusedButton}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onAddConfirm={handleAddConfirm}
          onAddCancel={handleAddCancel}
          onPalette={handlePalette}
          onPaletteClose={handlePaletteClose}
          onRecommend={handleRecommend}
          onColorChange={handleColorChange}
          onApplyTheme={onApplyTheme}
        />
      )}

      {!isAnalyzeMode && focusedButton === "recommend" && (
        <RecommendNodeOverlay
          open={focusedButton === "recommend"}
          onClose={() => setFocusedButton(null)}
          onSelectRecommendation={handleRecommendSelect}
        />
      )}
    </div>
  );
}

export default memo(NodeOverlay, (prev, next) =>
  prev.node.id === next.node.id &&
  prev.node.text === next.node.text &&
  prev.node.color === next.node.color &&
  prev.x === next.x &&
  prev.y === next.y &&
  prev.zoom === next.zoom &&
  prev.mode === next.mode &&
  prev.isSelected === next.isSelected &&
  prev.isAnalyzeSelected === next.isAnalyzeSelected &&
  prev.onCreateChildNode === next.onCreateChildNode
);
