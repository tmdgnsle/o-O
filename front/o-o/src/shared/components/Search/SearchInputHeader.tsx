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
  expandedWidth = "860px",
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
        className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-1.5
                 sm:pl-5 sm:pr-12 sm:py-2
                 focus:outline-none shadow-md text-xs sm:text-sm leading-tight"
      />
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 
                 p-1 hover:bg-gray-100 rounded-full transition-colors"
        onClick={handleSearch}
        type="button"
      >
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};

export default SearchInput;
