import { useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  expandedWidth?: string;
  collapsedWidth?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "검색어를 입력하세요",
  onSearch,
  expandedWidth = "900px",
  collapsedWidth = "289px",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`relative transition-all duration-150 ${className}`}
      style={{
        width: isFocused
          ? `min(${expandedWidth}, calc(100vw - 2rem))`
          : `min(${collapsedWidth}, calc(100vw - 2rem))`,
      }}
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 pl-4 pr-12 py-2
                 sm:pl-6 sm:pr-14 sm:py-3
                 focus:outline-none shadow-md text-sm sm:text-base"
      />
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 
                 p-2 hover:bg-gray-100 rounded-full transition-colors"
        onClick={handleSearch}
        type="button"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchInput;
