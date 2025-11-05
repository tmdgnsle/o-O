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
      <div className="flex items-center justify-center h-full text-gray-400 px-4">
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-center">
          아이디어를 기록한 날짜를 선택하면 키워드 구슬이 랜덤으로 표시됩니다.
        </p>
      </div>
    );
  }

  // 글자 크기 계산 함수 - 화면 크기 고려
  const getFontSize = (radius: number, textLength: number) => {
    const viewportWidth = window.innerWidth;

    // 화면 크기에 따른 기본 비율 조정
    let sizeRatio = 0.3;
    if (viewportWidth < 640) {
      sizeRatio = 0.25; // 모바일에서는 더 작게
    } else if (viewportWidth < 1024) {
      sizeRatio = 0.28; // 태블릿
    }

    let baseFontSize = radius * sizeRatio;

    // 텍스트 길이에 따라 조정
    if (textLength > 4) {
      baseFontSize *= 0.85;
    }
    if (textLength > 6) {
      baseFontSize *= 0.8;
    }

    // 화면 크기별 최소/최대 크기 제한
    const minSize = viewportWidth < 640 ? 10 : 12;
    const maxSize = viewportWidth < 640 ? 20 : viewportWidth < 1024 ? 24 : 28;

    return Math.max(minSize, Math.min(maxSize, baseFontSize));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {marbles.map((m) => {
        const fontSize = getFontSize(m.radius, m.text.length);

        return (
          <div
            key={m.id}
            className="absolute transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer 
                       sm:hover:scale-105 md:hover:scale-110"
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
              className="absolute inset-0 flex items-center justify-center font-semibold text-center 
                         px-1 sm:px-2 pointer-events-none leading-tight"
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
