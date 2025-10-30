import { useState } from "react";

export default function ModeToggleButton() {
  const [mode, setMode] = useState<"edit" | "analysis">("edit");

  return (
    <div className="relative inline-flex bg-gray-200 rounded-lg p-1 font-paperlogy">
      {/* 슬라이딩 배경 */}
      <div
        className={`absolute top-1 bottom-1 bg-primary rounded-md shadow-sm transition-all duration-300 ease-in-out ${
          mode === "edit" ? "left-1 right-1/2" : "left-1/2 right-1"
        }`}
      />

      {/* 모드 토글 버튼 */}
      <button
        onClick={() => setMode("edit")}
        className={`relative z-10 px-8 py-2 rounded-md transition-colors duration-300 ${
          mode === "edit" ? "text-[#F3F7FF] font-regular" : "text-primary"
        }`}
      >
        편집 모드
      </button>

      <button
        onClick={() => setMode("analysis")}
        className={`relative z-10 px-8 py-2 rounded-md transition-colors duration-300 ${
          mode === "analysis" ? "text-[#F3F7FF] font-regular" : "text-primary"
        }`}
      >
        분석 모드
      </button>
    </div>
  );
};