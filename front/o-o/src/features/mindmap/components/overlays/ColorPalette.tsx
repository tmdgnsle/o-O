import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
} from "@/components/ui/shadcn-io/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Color from "color";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorPaletteProps } from "../../types";

// 색상 테마 정의
const COLOR_THEMES = {
  Pastel: ["#FFD0EA", "#FFEEAC", "#C2F0F9", "#EFB39B", "#B9BDFF", "#C2DCF9", "#C3F9C2"],
  "Summer Beach": ["#F2674A", "#FCDED6", "#84A5F2", "#EA9A37", "#224ED1", "#AFC88E", "#CFAC9D"],
  Citrus: ["#CAE8F2", "#59A5B2", "#FBCC58", "#223F43", "#7CBC29", "#BAAC9D"],
  Retro: ["#FDF5E8", "#A0BBC4", "#F39069", "#DF614A", "#6F8240", "#AABA73", "#AF9A84"],
  Cool: ["#02182F", "#022F56", "#E2C7A1", "#E5ECEA", "#85C4E5", "#CCDDE4", "#488DB4"],
  Lavendar: ["#2B2356", "#AB9CC7", "#F2E2FF", "#FE5C8E", "#FFE1F1", "#39368E", "#8D4E93"],
} as const;

export default function ColorPalette({
  open,
  onColorChange,
  onApplyTheme,
  onClose,
  value = "#263A6B",
  className,
}: ColorPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof COLOR_THEMES>("Pastel");

  const handleThemeChange = (theme: keyof typeof COLOR_THEMES) => {
    setSelectedTheme(theme);
    // 전체 노드에 테마 적용
    if (onApplyTheme) {
      onApplyTheme([...COLOR_THEMES[theme]]);
    }
  };

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
        "absolute left-full ml-2 top-1/2 -translate-y-1/2 transition-all duration-300 z-999",
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

          {/* 테마 선택 */}
          <div>
            <span className="text-xs text-gray-600 block mb-2">테마 선택</span>
            <Select value={selectedTheme} onValueChange={(value) => handleThemeChange(value as keyof typeof COLOR_THEMES)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[1000]">
                {Object.keys(COLOR_THEMES).map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 테마의 색상들 */}
          <div>
            <span className="text-xs text-gray-600 block mb-2">컬러 팔레트</span>
            <div className="flex gap-2 flex-wrap">
              {COLOR_THEMES[selectedTheme].map((color) => (
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
