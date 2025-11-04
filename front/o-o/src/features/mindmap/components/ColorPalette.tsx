import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
} from "@/components/ui/shadcn-io/color-picker";
import Color from "color";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

type ColorPaletteProps = {
  open: boolean;
  onColorChange?: (color: string) => void;
  onClose?: () => void;
  value?: string;
  className?: string;
};

export default function ColorPalette({
  open,
  onColorChange,
  onClose,
  value = "#263A6B",
  className,
}: ColorPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((value: Parameters<typeof Color>[0]) => {
    try {
      const color = Color(value);
      const hex = color.hex();
      onColorChange?.(hex);
    } catch (error) {
      console.error("Color conversion error:", error);
    }
  }, [onColorChange]);

  // 외부 클릭 감지
  useEffect(() => {
    if (!open || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 약간의 딜레이 후 이벤트 리스너 등록 (팔레트 버튼 클릭과 충돌 방지)
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <div
      ref={paletteRef}
      className={cn(
        "absolute left-full ml-2 top-1/2 -translate-y-1/2 transition-all duration-300 z-50",
        open ? "opacity-100 visible" : "opacity-0 invisible",
        className
      )}
      style={{
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[280px] font-paperlogy">
        <div className="flex flex-col gap-4">
          {/* ColorPicker */}
          <ColorPicker
            key={value}
            defaultValue={value}
            onChange={handleChange}
          >
            {/* 제목 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                색상 테마
              </span>
            </div>

            {/* 색상 선택 영역 */}
            <div className="h-48 w-full">
              <ColorPickerSelection />
            </div>

            {/* Hue 슬라이더 */}
            <ColorPickerHue />

            {/* 색상 값 표시 및 EyeDropper */}
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper />
              <ColorPickerFormat className="flex-1" />
            </div>
          </ColorPicker>

          {/* 프리셋 색상 */}
          <div>
            <span className="text-xs text-gray-600 block mb-2">파스텔</span>
            <div className="flex gap-2 flex-wrap">
              {[
                "#FFB3BA", // 핑크
                "#FFDFBA", // 오렌지
                "#FFFFBA", // 옐로우
                "#BAFFC9", // 그린
                "#BAE1FF", // 블루
                "#D4BAFF", // 퍼플
                "#FFB3E6", // 마젠타
                "#FFE6F0", // 로즈
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange?.(color)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
