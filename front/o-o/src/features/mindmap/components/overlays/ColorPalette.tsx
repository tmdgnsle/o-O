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
import { COLOR_THEMES, type ColorThemeName } from "../../styles/colorThemes";
import { useColorTheme } from "../../hooks/useColorTheme";

export default function ColorPalette({
  open,
  onColorChange,
  onApplyTheme,
  onClose,
  value = "#263A6B",
  className,
}: ColorPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null);
  const { getCurrentTheme, setCurrentTheme } = useColorTheme();
  const [selectedTheme, setSelectedTheme] = useState<ColorThemeName>(() => getCurrentTheme());

  const handleThemeChange = (theme: ColorThemeName) => {
    setSelectedTheme(theme);
    setCurrentTheme(theme); // localStorage에 저장
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
            <Select value={selectedTheme} onValueChange={(value) => handleThemeChange(value as ColorThemeName)}>
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
