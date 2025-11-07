import CustomScrollbar from "@/shared/ui/CustomScrollbar";

export function TrendExpandKeyword() {
  const expandKeywords = [
    { id: 1, keyword: "소영언니" },
    { id: 2, keyword: "짱짱걸" },
    { id: 3, keyword: "짱짱걸" },
    { id: 4, keyword: "짱짱걸" },
    { id: 5, keyword: "짱짱걸" },
    { id: 6, keyword: "짱짱걸" },
    { id: 7, keyword: "짱짱걸" },
    { id: 8, keyword: "짱짱걸" },
    { id: 9, keyword: "짱짱걸" },
    { id: 10, keyword: "짱짱걸" },
    { id: 11, keyword: "짱짱걸" },
    { id: 12, keyword: "짱짱걸걸걸걸걸걸걸걸걸걸" },
  ];
  return (
    <div className="bg-[#F4F4F5] w-[226px] h-[60vh] rounded-3xl p-3">
      <CustomScrollbar maxHeight="55vh">
        <div className="pr-5">
          {expandKeywords.map((item) => (
            <div
              key={item.id}
              className="
                pl-4 pr-3 py-2 mb-1
                hover:bg-primary 
                rounded-xl 
                hover:text-white
                cursor-pointer 
                duration-200
                overflow-hidden
                text-ellipsis
                transition-colors
                whitespace-nowrap
              "
            >
              • {item.keyword}
            </div>
          ))}
        </div>
      </CustomScrollbar>
    </div>
  );
}
