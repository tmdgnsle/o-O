import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit3, Palette, Lightbulb } from "lucide-react";
import type { CSSProperties } from "react";
import ColorPalette from "./ColorPalette";
import AddInputBox from "./AddInputBox";
import type { RadialToolGroupProps } from "../../types";

export default function RadialToolGroup({
  open,
  radius = 150,
  paletteOpen = false,
  addInputOpen = false,
  currentColor = "#263A6B",
  focusedButton = null,
  onDelete,
  onEdit,
  onAdd,
  onAddConfirm,
  onAddCancel,
  onPalette,
  onPaletteClose,
  onRecommend,
  onColorChange,
  onApplyTheme,
}: RadialToolGroupProps) {
  const angles = [-70, -35, 0, 35, 70]; // 우측에 펼쳐질 각도

  const items = [
    /* 삭제하기 */
    {
      key: "delete",
      render: (
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      ),
    },

    /* 새 노드 추가 */
    {
      key: "add",
      render: (
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-[#2C4A7C] hover:bg-[#1e3456] text-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </Button>
      ),
    },

    /* 노드 수정 */
    {
      key: "edit",
      render: (
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-full border-2 border-[#2C4A7C] text-[#2C4A7C] hover:bg-[#2C4A7C] hover:text-white bg-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Edit3 className="w-5 h-5" />
        </Button>
      ),
    },

    /* 노드 색상 변경 */
    {
      key: "palette",
      render: (
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-full border-2 border-[#2C4A7C] text-[#2C4A7C] hover:bg-[#2C4A7C] hover:text-white bg-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onPalette?.();
          }}
        >
          <Palette className="w-5 h-5" />
        </Button>
      ),
    },

    /* 추천 */
    {
      key: "recommend",
      render: (
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-[#429AE6] hover:bg-[#4a73a8] text-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onRecommend?.();
          }}
        >
          <Lightbulb className="w-5 h-5" />
        </Button>
      ),
    },
  ];

  const centerStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none", // let clicks fall through, except on buttons
  };

  return (
    <div className="absolute inset-0 z-40 overflow-visible" style={{ pointerEvents: "none" }}>
      <div style={centerStyle}>
        {items.map((it, i) => {
          // focusedButton이 있으면 해당 버튼만 표시, 없으면 모두 표시
          const shouldShow = focusedButton === null || focusedButton === it.key;

          const rad = ((angles[i] ?? 0) * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const style: CSSProperties = {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${open && shouldShow ? 1 : 0.8})`,
            opacity: open && shouldShow ? 1 : 0,
            transition: "transform 240ms ease, opacity 240ms ease",
            transitionDelay: `${i * 60}ms`,
            pointerEvents: open && shouldShow ? "auto" : "none",
          };
          return (
            <div key={it.key} style={style}>
              {it.render}
              {/* palette 버튼 옆에 ColorPalette 표시 */}
              {it.key === "palette" && (
                <ColorPalette
                  open={paletteOpen}
                  value={currentColor}
                  onColorChange={onColorChange}
                  onApplyTheme={onApplyTheme}
                  onClose={onPaletteClose}
                />
              )}
              {/* add 버튼 옆에 AddInputBox 표시 */}
              {it.key === "add" && onAddConfirm && onAddCancel && (
                <AddInputBox
                  open={addInputOpen}
                  onConfirm={onAddConfirm}
                  onCancel={onAddCancel}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
