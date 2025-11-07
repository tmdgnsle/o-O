// components/KeywordGrid.tsx
import { type Keyword } from "@/features/trend/types";
import { KeywordBox } from "./KeywordBox";

interface KeywordGridProps {
  readonly keywords: Keyword[];
  readonly colors: string[];
}

export function KeywordGrid({ keywords, colors }: KeywordGridProps) {
  return (
    <div
      className="
        grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 lg:gap-4 
        w-full max-w-8xl mx-auto px-3
        h-[calc(100vh-100px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-180px)]
      "
    >
      <div className="row-span-1 col-span-2">
        <KeywordBox text={keywords[0]?.text} colorClass={colors[0]} />
      </div>
      <div className="row-span-2">
        <KeywordBox text={keywords[2]?.text} colorClass={colors[2]} />
      </div>
      <div className="row-span-3">
        <KeywordBox text={keywords[3]?.text} colorClass={colors[3]} />
      </div>
      <div className="row-span-2">
        <KeywordBox text={keywords[1]?.text} colorClass={colors[1]} />
      </div>
      <div className="row-span-2">
        <KeywordBox text={keywords[4]?.text} colorClass={colors[4]} />
      </div>
      <div />
    </div>
  );
}
