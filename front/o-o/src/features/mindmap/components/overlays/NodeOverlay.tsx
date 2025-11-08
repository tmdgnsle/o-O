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
import {
  useDeleteNode,
  useEditNode,
} from "../../hooks/mutation/useNodeMutations";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import type { CytoscapeNodeOverlayProps } from "../../types";

/**
 * NodeOverlay
 * - Cytoscape 노드 위에 렌더링되는 HTML overlay
 * - 노드 UI, 편집, 툴 그룹 등 모든 인터랙션 담당
 */
function NodeOverlay({
  node,
  x,
  y,
  zoom,
  isSelected,
  onSelect,
  onDeselect,
  onApplyTheme,
  onCreateChildNode,
}: Readonly<CytoscapeNodeOverlayProps>) {
  const { id, text, color: initialColor } = node;

  // Mutation hooks
  const deleteNodeMutation = useDeleteNode();
  const editNodeMutation = useEditNode();
  // Add-node mutation is handled upstream to avoid passing nodes array here

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

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) scale(${zoom})`,
        zIndex,
        pointerEvents: "none", // Cytoscape가 드래그를 처리하도록
      }}
    >
      {/* 노드 원 - 시각적 표현만 담당, 클릭/드래그는 Cytoscape가 처리 */}
      <div
        className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ${
          isSelected ? "ring-4 ring-primary/30" : ""
        }`}
        style={{
          backgroundColor: initialColor,
          pointerEvents: "none", // 드래그를 위해 투과
        }}
      >
        {isEditing ? (
          <NodeEditForm
            value={editValue}
            onChange={setEditValue}
            onConfirm={handleEditConfirm}
            onCancel={handleEditCancel}
          />
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

// React.memo로 감싸서 불필요한 재렌더링 방지
export default memo(NodeOverlay, (prevProps, nextProps) => {
  // node 데이터가 변경되지 않았고, 위치와 선택 상태가 같으면 재렌더링 스킵
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.text === nextProps.node.text &&
    prevProps.node.color === nextProps.node.color &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onCreateChildNode === nextProps.onCreateChildNode
  );
});
