interface SearchRecommendSectionProps {
  readonly onKeywordClick: (keyword: string) => void;
  readonly selectedKeyword: string | null;
}

export function SearchRecommendSection({
  onKeywordClick,
  selectedKeyword,
}: SearchRecommendSectionProps) {
  const keywords = ["침착맨", "메인", "카피바라", "동동이", "오늘의 키워드"];

  const handleClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      onKeywordClick("");
    } else {
      onKeywordClick(keyword);
    }
  };

  return (
    <section>
      <div
        className="
          flex text-[10px] sm:text-[16px] md:text-[18px] lg:text-[20px]
          gap-0 sm:gap-8 md:gap-16 lg:gap-28
        "
      >
        {keywords.map((keyword) => (
          <button
            className={`
              px-4 py-1
              rounded-full 
              font-[500]
              transition-all 
              ${
                selectedKeyword === keyword
                  ? "bg-primary text-white"
                  : "text-semi-deep-gray  hover:bg-gray"
              }
            `}
            key={keyword}
            onClick={() => handleClick(keyword)}
          >
            {keyword}
          </button>
        ))}
      </div>
    </section>
  );
}
