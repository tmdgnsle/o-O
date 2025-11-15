import { memo, useCallback, useState } from "react";
import RadialToolGroup from "./RadialToolGroup";
import RecommendNodeOverlay from "./RecommendNodeOverlay";
import NodeEditForm from "./NodeEditForm";
import NodeDetailModal from "./NodeDetailModal";
import { useNodeTextEdit } from "../../hooks/custom/useNodeTextEdit";
import { useNodeAdd } from "../../hooks/custom/useNodeAdd";
import { useNodeColorEdit } from "../../hooks/custom/useNodeColorEdit";
import { useNodeFocus } from "../../hooks/custom/useNodeFocus";
import { useNodeZIndex } from "../../hooks/custom/useNodeZIndex";
import { useNodeHandlers } from "../../hooks/custom/useNodeHandlers";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import { createRadialGradient } from "@/shared/utils/gradientUtils";
import type { CytoscapeNodeOverlayProps } from "../../types";
import warningPopoImage from "@/shared/assets/images/warning_popo.webp";
import ConfirmDialog from "../../../../shared/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PhotoSizeSelectActualOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActualOutlined";

function NodeOverlay({
  node,
  x,
  y,
  zoom,
  hasChildren,
  mode,
  isSelected,
  isAnalyzeSelected,
  onSelect,
  onDeselect,
  onApplyTheme,
  onDeleteNode,
  onEditNode,
  onCreateChildNode,
  detachedSelection,
  onKeepChildrenDelete,
  onConnectDetachedSelection,
  onDismissDetachedSelection,
}: Readonly<CytoscapeNodeOverlayProps>) {
  const { text, memo, color: initialColor } = node;
  const isAnalyzeMode = mode === "analyze";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    isEditing,
    editValue,
    editMemo,
    setEditValue,
    setEditMemo,
    startEdit,
    cancelEdit,
    confirmEdit,
  } = useNodeTextEdit(text, memo);
  const { showAddInput, openAddInput, closeAddInput } = useNodeAdd();
  const { paletteOpen, togglePalette, closePalette } =
    useNodeColorEdit(initialColor);
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
    deleteNode: onDeleteNode,
    editNode: onEditNode,
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

  const handleDeleteRequest = useCallback(() => {
    if (hasChildren) {
      setFocusedButton(null);
      setDeleteDialogOpen(true);
      return;
    }
    handleDelete();
  }, [hasChildren, handleDelete, setFocusedButton]);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteOnlyCurrent = useCallback(() => {
    if (hasChildren) {
      onKeepChildrenDelete?.({
        deletedNodeId: node.id,
        parentId: node.parentId ?? null,
      });
    }
    handleDelete();
    setDeleteDialogOpen(false);
  }, [handleDelete, hasChildren, node.id, node.parentId, onKeepChildrenDelete]);

  const handleDeleteWithChildren = useCallback(() => {
    handleDelete({ deleteDescendants: true });
    setDeleteDialogOpen(false);
  }, [handleDelete]);

  const handleConnectDetachedSelection = useCallback(() => {
    if (!detachedSelection) return;
    onConnectDetachedSelection?.(detachedSelection.anchorNodeId);
  }, [detachedSelection, onConnectDetachedSelection]);

  const handleDismissDetachedSelection = useCallback(() => {
    if (!detachedSelection) return;
    onDismissDetachedSelection?.(detachedSelection.anchorNodeId);
  }, [detachedSelection, onDismissDetachedSelection]);

  const handleIconClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === "image" || node.type === "video") {
      setDetailModalOpen((prev) => !prev);
    }
  }, [node.type]);

  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "analyze") return; // 분석 모드에서는 별도 처리

    // Edit 모드에서 노드 클릭 토글
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [mode, isSelected, onSelect, onDeselect]);

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
    <>
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
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${selectionRingClass}`}
          style={{
            background: createRadialGradient(initialColor),
            pointerEvents: isAnalyzeMode ? "none" : "auto",
          }}
          onClick={handleNodeClick}
        >
          {isEditing ? (
            <NodeEditForm
              value={editValue}
              memo={editMemo}
              onChange={setEditValue}
              onMemoChange={setEditMemo}
              onConfirm={handleEditConfirm}
              onCancel={handleEditCancel}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center px-4 text-center"
              style={{
                pointerEvents: "none",
              }}
            >
              {node.type === "image" ? (
                <>
                  <div
                    className="rounded-lg mb-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ pointerEvents: "auto" }}
                    onClick={handleIconClick}
                  >
                    <PhotoSizeSelectActualOutlinedIcon
                      sx={{ fontSize: 60, color: textColor }}
                    />
                  </div>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-2"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              ) : node.type === "video" ? (
                <>
                  <div
                    className="rounded-lg mb-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ pointerEvents: "auto" }}
                    onClick={handleIconClick}
                  >
                    <YouTubeIcon sx={{ fontSize: 60, color: textColor }} />
                  </div>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-2"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span
                    className="font-paperlogy font-bold text-base mb-1 break-words"
                    style={{ color: textColor }}
                  >
                    {text}
                  </span>
                  {memo && (
                    <span
                      className="font-paperlogy text-xs leading-tight break-words line-clamp-3"
                      style={{ color: textColor, opacity: 0.85 }}
                    >
                      {memo}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {!isAnalyzeMode && (
          <RadialToolGroup
            open={isSelected && !isEditing && focusedButton !== "recommend"}
            paletteOpen={paletteOpen}
            addInputOpen={showAddInput}
            currentColor={initialColor}
            focusedButton={focusedButton}
            centerX={x}
            centerY={y}
            onDelete={handleDeleteRequest}
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
            selectedNodeX={x}
            selectedNodeY={y}
          />
        )}

        {!isAnalyzeMode && detachedSelection && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 pointer-events-auto flex flex-col items-start gap-2">
            <Button
              className="rounded-2xl bg-[#2C4A7C] hover:bg-[#1e3456] px-5 py-2 text-sm font-semibold text-white shadow-lg"
              onClick={handleConnectDetachedSelection}
            >
              아이디어 연결하기
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-[#2C4A7C] hover:underline"
              onClick={handleDismissDetachedSelection}
            >
              이대로 유지하기
            </button>
          </div>
        )}
      </div>

      {deleteDialogOpen && (
        <div className="pointer-events-auto">
          <ConfirmDialog
            isOpen={deleteDialogOpen}
            characterImage={warningPopoImage}
            title="주의"
            description={
              "선택한 아이디어에 하위 아이디어가 있습니다.\n하위 아이디어까지 삭제하시겠습니까?"
            }
            onClose={handleDeleteDialogClose}
            buttons={[
              {
                id: "delete-all",
                text: "모두 삭제",
                onClick: handleDeleteWithChildren,
                variant: "outline",
              },
              {
                id: "delete-current",
                text: "선택한 아이디어만 삭제",
                onClick: handleDeleteOnlyCurrent,
              },
            ]}
          />
        </div>
      )}

      <NodeDetailModal
        isOpen={detailModalOpen}
        node={node}
        nodeX={x}
        nodeY={y}
        onClose={() => setDetailModalOpen(false)}
      />
    </>
  );
}

export default memo(
  NodeOverlay,
  (prev, next) =>
    prev.node.id === next.node.id &&
    prev.node.text === next.node.text &&
    prev.node.memo === next.node.memo &&
    prev.node.color === next.node.color &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.zoom === next.zoom &&
    prev.mode === next.mode &&
    prev.hasChildren === next.hasChildren &&
    prev.isSelected === next.isSelected &&
    prev.isAnalyzeSelected === next.isAnalyzeSelected &&
    prev.detachedSelection?.id === next.detachedSelection?.id &&
    prev.onCreateChildNode === next.onCreateChildNode &&
    prev.onKeepChildrenDelete === next.onKeepChildrenDelete &&
    prev.onConnectDetachedSelection === next.onConnectDetachedSelection &&
    prev.onDismissDetachedSelection === next.onDismissDetachedSelection
);
