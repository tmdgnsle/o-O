interface SearchRecommendSectionProps {
  readonly onKeywordClick: (keyword: string) => void;
  readonly selectedKeyword: string | null;
}

export function SearchRecommendSection({
  onKeywordClick,
  selectedKeyword,
}: SearchRecommendSectionProps) {
  const keywords = ["침착맨", "메인", "카피바라", "동동이"];

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
        className="flex text-[clamp(15px,1.5vw,36px)]"
        style={{ gap: "clamp(0.5rem, 10vw, 8rem)" }}
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
