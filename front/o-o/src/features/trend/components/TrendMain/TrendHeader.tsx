import SearchInput from "@/shared/components/Search/SearchInputHeader";

export function TrendHeader() {
  return (
    <div className="flex justify-between items-center">
      <p className="md:text-xl sm:text-md font-bold">
        실시간 인기있는 아이디어
      </p>
      <SearchInput
        placeholder="찾고 싶은 키워드를 입력하세요."
        onSearch={(query) => console.log(query)}
      />
    </div>
  );
}
