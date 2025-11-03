import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/shadcn-io/color-picker";
import Color from "color";

type ColorPaletteProps = {
  open: boolean;
  onColorChange?: (color: string) => void;
  defaultColor?: string;
};

export default function ColorPalette({
  open,
  onColorChange,
  defaultColor = "#2D71B9",
}: ColorPaletteProps) {
  const handleChange = (value: Parameters<typeof Color>[0]) => {
    try {
      const color = Color(value);
      const hex = color.hex();
      onColorChange?.(hex);
    } catch (error) {
      console.error("Color conversion error:", error);
    }
  };

  return (
    <div
      className={`absolute left-[calc(100%+20px)] top-1/2 -translate-y-1/2 transition-all duration-300 ${
        open ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      style={{
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[280px] font-paperlogy">
        <div className="flex flex-col gap-4">
          {/* ColorPicker */}
          <ColorPicker defaultValue={defaultColor} onChange={handleChange}>
            {/* 제목 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                색상 테마
              </span>
              <ColorPickerOutput />
            </div>

            {/* 색상 선택 영역 */}
            <div className="h-48 w-full">
              <ColorPickerSelection />
            </div>

            {/* Hue 슬라이더 */}
            <ColorPickerHue />

            {/* Alpha 슬라이더 */}
            <ColorPickerAlpha />

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