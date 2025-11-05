import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import RadialToolGroup from "./RadialToolGroup";
import RecommendNodeOverlay from "./RecommendNodeOverlay";
import { useNodeTextEdit } from "../hooks/custom/useNodeTextEdit";
import { useNodeAdd } from "../hooks/custom/useNodeAdd";
import { useNodeColorEdit } from "../hooks/custom/useNodeColorEdit";
import {
  useDeleteNode,
  useEditNode,
  useAddNode,
} from "../hooks/mutation/useNodeMutations";
import type { NodeData } from "../pages/MindmapPage";
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
  } = useNodeTextEdit(text);

  const {
    showAddInput,
    addValue,
    setAddValue,
    openAddInput,
    closeAddInput,
    confirmAdd,
  } = useNodeAdd();

  const { paletteOpen, togglePalette, closePalette } = useNodeColorEdit(initialColor);

  // focusedButton 상태 관리
  const [focusedButton, setFocusedButton] = useState<"delete" | "add" | "edit" | "palette" | "recommend" | null>(null);

  const handleClick = () => {
    if (isSelected) {
      onDeselect();
      setFocusedButton(null);
    } else {
      onSelect();
      setFocusedButton(null);
    }
  };

  const handleDelete = () => {
    deleteNodeMutation.mutate(id);
    onDeselect();
    setFocusedButton(null);
  };

  const handleEdit = () => {
    startEdit();
    setFocusedButton("edit");
  };

  const handleEditCancel = () => {
    cancelEdit();
    setFocusedButton(null);
  };

  const handleEditConfirm = () => {
    const newText = confirmEdit();
    if (newText) {
      editNodeMutation.mutate({ nodeId: id, newText });
    }
    setFocusedButton(null);
  };

  const handleAdd = () => {
    openAddInput();
    setFocusedButton("add");
  };

  const handleAddCancel = () => {
    closeAddInput();
    setFocusedButton(null);
  };

  const handleAddConfirm = () => {
    const newText = confirmAdd();
    if (newText) {
      const newNode: NodeData = {
        id: Date.now().toString(),
        text: newText,
        x: x + 200, // 우측에 배치
        y: y,
        color: '#263A6B', // 기본 색상
      };
      addNodeMutation.mutate(newNode);
    }
    setFocusedButton(null);
  };

  const handlePalette = () => {
    const willBeOpen = !paletteOpen;
    togglePalette();
    setFocusedButton(willBeOpen ? "palette" : null);
  };

  const handleColorChange = useCallback((newColor: string) => {
    if (newColor === initialColor) {
      return;
    }

    // mutation만 호출 - query가 자동으로 업데이트되어 리렌더링됨
    editNodeMutation.mutate({ nodeId: id, newColor });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialColor]);

  const handlePaletteClose = () => {
    closePalette();
    setFocusedButton(null);
  };

  const handleRecommend = () => {
    setFocusedButton("recommend");
  };

  // 배경색에 따른 텍스트 색상 결정
  const textColor = getContrastTextColor(initialColor);

  // z-index 계산
  // - 추천 오버레이 활성화 + 선택됨: 600 (배경 500보다 위, 추천 노드들과 같은 레벨)
  // - 선택됨: 40
  // - 기본: 10
  const zIndex = focusedButton === "recommend" && isSelected ? 600 : isSelected ? 40 : 10;

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
              if (e.key === "Escape") handleAddCancel();
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
            onClick={handleAddCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Recommendation Overlay */}
      {focusedButton === "recommend" && (
        <RecommendNodeOverlay
          open={focusedButton === "recommend"}
          onClose={() => setFocusedButton(null)}
          onSelectRecommendation={(recommendText) => {
            const newNode: NodeData = {
              id: Date.now().toString(),
              text: recommendText,
              x: x + 200,
              y: y,
              color: '#263A6B',
            };
            addNodeMutation.mutate(newNode);
            setFocusedButton(null);
          }}
        />
      )}
    </div>
  );
}
