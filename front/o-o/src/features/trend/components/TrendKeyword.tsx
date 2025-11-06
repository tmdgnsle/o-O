// components/TrendKeyword.tsx
import { useEffect, useState } from "react";
import popo from "@/shared/assets/images/popo1.png";

interface Keyword {
  id: number;
  text: string;
}

interface TrendKeywordProps {
  readonly keywords?: Keyword[];
  readonly characterImage?: string;
}

// 더미 데이터
const DEFAULT_KEYWORDS: Keyword[] = [
  { id: 1, text: "사흘로" },
  { id: 2, text: "알고리즘" },
  { id: 3, text: "무지개" },
  { id: 4, text: "누가크래커" },
  { id: 5, text: "화재" },
];

// 각 키워드별 색상
const KEYWORD_COLORS = [
  "bg-green-200 hover:bg-green-300", // 사흘로
  "bg-orange-200 hover:bg-orange-300", // 알고리즘
  "bg-purple-200 hover:bg-purple-300", // 무지개
  "bg-yellow-200 hover:bg-yellow-300", // 누가크래커
  "bg-cyan-200 hover:bg-cyan-300", // 화재
];

export function TrendKeyword({
  keywords = DEFAULT_KEYWORDS,
  characterImage = popo,
}: TrendKeywordProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      // window.innerHeight와 screen.height가 거의 같으면 전체화면
      // 오차범위 50px 정도 허용
      const heightDiff = Math.abs(window.innerHeight - window.screen.height);
      const widthDiff = Math.abs(window.innerWidth - window.screen.width);

      setIsFullscreen(heightDiff < 50 && widthDiff < 50);
    };

    checkFullscreen();

    // 윈도우 크기 변경 감지
    window.addEventListener("resize", checkFullscreen);

    return () => {
      window.removeEventListener("resize", checkFullscreen);
    };
  }, []);

  return (
    <div className="w-full h-full overflow-hidden relative py-4 md:py-6">
      <div
        className={`
          grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 lg:gap-4 w-full max-w-6xl mx-auto
          ${isFullscreen ? "h-[76vh]" : "h-[71vh]"}
        `}
      >
        {/* 1행 */}
        <div className="row-span-1 col-span-2">
          <KeywordBox text={keywords[0]?.text} colorClass={KEYWORD_COLORS[0]} />
        </div>
        <div className="row-span-2">
          <KeywordBox text={keywords[2]?.text} colorClass={KEYWORD_COLORS[2]} />
        </div>
        {/* 2행 */}
        <div className="row-span-3">
          <KeywordBox text={keywords[3]?.text} colorClass={KEYWORD_COLORS[3]} />
        </div>
        <div className="row-span-2">
          <KeywordBox
            text={keywords[1]?.text}
            colorClass={KEYWORD_COLORS[1]}
            isLarge
          />
        </div>
        <div className="row-span-2">
          <KeywordBox text={keywords[4]?.text} colorClass={KEYWORD_COLORS[4]} />
        </div>
        <div />
      </div>

      {/* Floating 포포 캐릭터 - 전체화면일 때만 크게 */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 z-10">
        <div
          className="relative flex items-center justify-center"
          style={{
            width: isFullscreen
              ? "clamp(400px, 40vw, 600px)"
              : "clamp(200px, 25vw, 350px)",
            height: isFullscreen
              ? "clamp(400px, 40vw, 600px)"
              : "clamp(200px, 25vw, 350px)",
          }}
        >
          <img
            src={characterImage}
            alt="character"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

// 키워드 박스 컴포넌트
interface KeywordBoxProps {
  readonly text?: string;
  readonly colorClass: string;
  readonly isLarge?: boolean;
}

function KeywordBox({ text, colorClass, isLarge = false }: KeywordBoxProps) {
  if (!text) return null;

  return (
    <div
      className={`
        w-full h-full ${colorClass}
        rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center
        font-bold text-gray-800
        shadow-lg hover:shadow-xl
        transition-all duration-300 hover:scale-105
        cursor-pointer px-2 sm:px-3 md:px-4
        ${isLarge ? "text-base sm:text-xl md:text-2xl" : "text-sm sm:text-base md:text-lg"}
      `}
    >
      <span className="truncate text-center">{text}</span>
    </div>
  );
}
