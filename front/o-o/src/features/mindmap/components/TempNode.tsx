import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import RadialToolGroup from "./RadialToolGroup";
import { useNodeEdit } from "../hooks/custom/useNodeEdit";
import { useNodeAdd } from "../hooks/custom/useNodeAdd";
import { useNodeColor } from "../hooks/custom/useNodeColor";
import {
  useDeleteNode,
  useEditNode,
  useAddNode,
} from "../hooks/mutation/useNodeMutations";
import type { NodeData } from "../pages/MindmapPage";

type TempNodeProps = {
  id: string;
  text: string;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
};

export default function TempNode({
  id,
  text,
  x,
  y,
  isSelected,
  onSelect,
  onDeselect,
}: TempNodeProps) {
  // Mutation hooks
  const deleteNodeMutation = useDeleteNode();
  const editNodeMutation = useEditNode();
  const addNodeMutation = useAddNode();

  // Custom hooks 사용
  const {
    isEditing,
    editValue,
    setEditValue,
    startEdit,
    cancelEdit,
    confirmEdit,
  } = useNodeEdit(text);

  const {
    showAddInput,
    addValue,
    setAddValue,
    openAddInput,
    closeAddInput,
    confirmAdd,
  } = useNodeAdd();

  const { paletteOpen, color, togglePalette, changeColor } = useNodeColor();

  const handleClick = () => {
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  const handleDelete = () => {
    deleteNodeMutation.mutate(id);
    onDeselect();
  };

  const handleEditConfirm = () => {
    const newText = confirmEdit();
    if (newText) {
      editNodeMutation.mutate({ nodeId: id, newText });
    }
  };

  const handleAddConfirm = () => {
    const newText = confirmAdd();
    if (newText) {
      const newNode: NodeData = {
        id: Date.now().toString(),
        text: newText,
        x: x + 200, // 우측에 배치
        y: y,
      };
      addNodeMutation.mutate(newNode);
    }
  };

  return (
    <div className="relative inline-block select-none">
      {/* 노드 원 */}
      <div
        onClick={handleClick}
        className={`w-56 h-56 rounded-full bg-primary flex items-center justify-center cursor-pointer transition-all ${
          isSelected ? "ring-4 ring-primary/30" : ""
        }`}
      >
        {isEditing ? (
          <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-32 h-10 text-sm text-center bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditConfirm();
                if (e.key === "Escape") cancelEdit();
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
                onClick={cancelEdit}
                className="h-8 px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="text-white font-paperlogy font-semibold text-lg px-6 text-center break-words">
            {text}
          </span>
        )}
      </div>

      {/* Radial Tool Group */}
      <RadialToolGroup
        open={isSelected && !isEditing}
        paletteOpen={paletteOpen}
        currentColor={color}
        onDelete={handleDelete}
        onEdit={startEdit}
        onAdd={openAddInput}
        onPalette={togglePalette}
        onColorChange={changeColor}
      />

      {/* Add Child Input - 우측에 표시 */}
      {showAddInput && (
        <div
          className="absolute top-1/2 left-full ml-8 -translate-y-1/2 flex items-center gap-2 bg-white p-3 rounded-lg shadow-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            placeholder="새 아이디어를 연결해보세요."
            className="w-48"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddConfirm();
              if (e.key === "Escape") closeAddInput();
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAddConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeAddInput}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}