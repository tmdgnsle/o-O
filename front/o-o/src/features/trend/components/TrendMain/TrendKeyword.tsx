// components/TrendKeyword.tsx
import popo from "@/shared/assets/images/popo4.png";
import { type TrendKeywordProps, type Keyword } from "@/features/trend/types";
import { useFullscreen } from "@/features/trend/hooks/custom/useFullscreen";
import { KeywordGrid } from "./KeywordGrid";
import { FloatingCharacter } from "./FloatingCharacter";

const DEFAULT_KEYWORDS: readonly Keyword[] = [
  { id: 1, text: "소영언니" },
  { id: 2, text: "시니어개발자최고" },
  { id: 3, text: "시니어디자이너멋지다" },
  { id: 4, text: "할무니!!!" },
  { id: 5, text: "5시에 일어남!!" },
] as const;

const KEYWORD_COLORS: readonly string[] = [
  "bg-green-200 hover:bg-green-300",
  "bg-orange-200 hover:bg-orange-300",
  "bg-purple-200 hover:bg-purple-300",
  "bg-yellow-200 hover:bg-yellow-300",
  "bg-cyan-200 hover:bg-cyan-300",
] as const;

export function TrendKeyword({
  keywords = DEFAULT_KEYWORDS,
  characterImage = popo,
}: Readonly<TrendKeywordProps>) {
  const isFullscreen = useFullscreen();

  return (
    <div className="w-full overflow-hidden relative py-4 md:py-6 px-2 md:px-10">
      <KeywordGrid keywords={keywords} colors={KEYWORD_COLORS} />
      <FloatingCharacter image={characterImage} isFullscreen={isFullscreen} />
    </div>
  );
}
