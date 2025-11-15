import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export interface SearchInputHandle {
  clear: () => void;
}

const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  ({ placeholder = "검색어를 입력하세요", onSearch, className = "" }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const isComposingRef = useRef(false);

    // imperative handle로 clear 메서드 노출
    useImperativeHandle(ref, () => ({
      clear: () => {
        console.log("🧹 SearchInput 초기화");
        setSearchQuery("");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
    }));

    const handleSearch = () => {
      console.log("🔍 검색 버튼 클릭, 검색어:", searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      console.log("📝 입력 변경:", value);
      setSearchQuery(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isComposingRef.current) {
        console.log("⌨️ Enter 키 입력, 검색어:", searchQuery);
        handleSearch();
      }
    };

    // 한글 입력 지원
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = (
      e: React.CompositionEvent<HTMLInputElement>
    ) => {
      isComposingRef.current = false;
      const value = (e.target as HTMLInputElement).value;
      console.log("📝 한글 입력 완료:", value);
      setSearchQuery(value);
    };

    return (
      <div
        className={`relative transition-all duration-150 ${
          isFocused
            ? "w-64 sm:w-[460px] md:w-[600px] lg:w-[780px]"
            : "w-64 sm:w-80 md:w-[289px] lg:w-[289px]"
        } ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
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
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
