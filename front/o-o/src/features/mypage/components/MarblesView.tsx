import Marble from "@/shared/assets/images/marble.png";
import { useMarbleLayout } from "../hooks/useMarbleLayout";
import { useRef } from "react";

interface MarblesViewProps {
  keywords: string[];
}

export function MarblesView({ keywords }: MarblesViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marbles = useMarbleLayout(keywords, containerRef);

  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>날짜를 선택하면 키워드 구슬이 표시됩니다.</p>
      </div>
    );
  }

  // 글자 크기 계산 함수
  const getFontSize = (radius: number, textLength: number) => {
    // 기본 크기: 구슬 반지름의 25-35%
    let baseFontSize = radius * 0.3;

    // 텍스트 길이에 따라 조정
    if (textLength > 4) {
      baseFontSize *= 0.85; // 긴 텍스트는 약간 작게
    }
    if (textLength > 6) {
      baseFontSize *= 0.8; // 더 긴 텍스트는 더 작게
    }

    // 최소/최대 크기 제한
    return Math.max(12, Math.min(28, baseFontSize));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {marbles.map((m) => {
        const fontSize = getFontSize(m.radius, m.text.length);

        return (
          <div
            key={m.id}
            className="absolute transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer"
            style={{
              left: m.x,
              top: m.y,
              width: `${m.radius * 2}px`,
              height: `${m.radius * 2}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img
              src={Marble}
              alt="marble"
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12))",
              }}
            />
            <span
              className="absolute inset-0 flex items-center justify-center font-semibold text-center px-2 pointer-events-none leading-tight"
              style={{
                fontSize: `${fontSize}px`,
                color: "#2d3748",
              }}
            >
              {m.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
