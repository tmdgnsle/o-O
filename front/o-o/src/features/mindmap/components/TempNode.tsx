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

type TempNodeProps = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onApplyTheme: (colors: string[]) => void;
};

export default function TempNode({
  id,
  text,
  x,
  y,
  color: initialColor,
  isSelected,
  onSelect,
  onDeselect,
  onApplyTheme,
}: TempNodeProps) {
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

  const {
    showAddInput,
    openAddInput,
    closeAddInput,
  } = useNodeAdd();

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
    x,
    y,
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

  // 배경색에 따른 텍스트 색상 결정
  const textColor = getContrastTextColor(initialColor);

  return (
    <div className="relative inline-block select-none" style={{ zIndex }}>
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

      {/* Add Child Input - 우측에 표시 */}
      {showAddInput && (
        <AddInputBox
          onConfirm={handleAddConfirm}
          onCancel={handleAddCancel}
        />
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
