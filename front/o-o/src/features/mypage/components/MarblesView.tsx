import Marble from "@/shared/assets/images/marble.png";
import { useMarbleLayout } from "../hooks/useMarbleLayout";
import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFontSize } from "@/shared/utils/fontSizeUtil";

interface MarblesViewProps {
  readonly keywords: Array<{ keyword: string; mindmapId: string }>;
}

export function MarblesView({ keywords }: MarblesViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const keywordStrings = useMemo(
    () => keywords.map((k) => k.keyword),
    [keywords.map((k) => k.keyword).join(",")] // 키워드 문자열로 비교
  );

  const marbles = useMarbleLayout(keywordStrings, containerRef);

  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 px-4">
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-center">
          아이디어를 기록한 날짜를 선택하면 키워드 구슬이 랜덤으로 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {marbles.map((m, index) => {
        const fontSize = getFontSize(m.radius, m.text.length);
        const mindmapId = keywords[index]?.mindmapId;

        return (
          <button
            type="button"
            key={m.id}
            onClick={() => {
              if (mindmapId) {
                navigate(`/project/${mindmapId}`);
              }
            }}
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
          </button>
        );
      })}
    </div>
  );
}
