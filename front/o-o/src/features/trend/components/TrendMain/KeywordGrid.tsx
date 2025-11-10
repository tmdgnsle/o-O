// components/KeywordGrid.tsx
import { type Keyword } from "@/features/trend/types";
import { KeywordBox } from "./KeywordBox";
import { useNavigate } from "react-router-dom";

interface KeywordGridProps {
  readonly keywords: readonly Keyword[];
  readonly colors: readonly string[];
}

export function KeywordGrid({ keywords, colors }: KeywordGridProps) {
  const navigate = useNavigate();

  const handleClick = (keywordId: number) => {
    navigate(`/trend/${keywordId}`);
  };

  return (
    <div
      className="
        grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 lg:gap-4 
        w-full max-w-8xl mx-auto px-3
        h-[calc(100vh-100px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-180px)]
      "
    >
      <div className="row-span-1 col-span-2">
        <KeywordBox
          text={keywords[0]?.text}
          colorClass={colors[0]}
          onClick={() => handleClick(keywords[0]?.id || 1)}
        />
      </div>
      <div className="row-span-2">
        <KeywordBox
          text={keywords[2]?.text}
          colorClass={colors[2]}
          onClick={() => handleClick(keywords[2]?.id || 1)}
        />
      </div>
      <div className="row-span-3">
        <KeywordBox
          text={keywords[3]?.text}
          colorClass={colors[3]}
          onClick={() => handleClick(keywords[3]?.id || 1)}
        />
      </div>
      <div className="row-span-2">
        <KeywordBox
          text={keywords[1]?.text}
          colorClass={colors[1]}
          onClick={() => handleClick(keywords[1]?.id || 1)}
        />
      </div>
      <div className="row-span-2">
        <KeywordBox
          text={keywords[4]?.text}
          colorClass={colors[4]}
          onClick={() => handleClick(keywords[4]?.id || 1)}
        />
      </div>
      <div />
    </div>
  );
}
