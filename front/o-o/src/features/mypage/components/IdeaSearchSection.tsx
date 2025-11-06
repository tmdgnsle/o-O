import { useState } from "react";
import { Search } from "lucide-react";

export function IdeaSearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex justify-end sm:px-14 px-5 py-2 sm:py-0">
      <div
        className="relative transition-all duration-150"
        style={{
          width: isFocused
            ? "min(900px, calc(100vw - 2rem))"
            : "min(289px, calc(100vw - 2rem))",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-full border border-gray-300 pl-4 pr-12 py-2
                   sm:pl-6 sm:pr-14 sm:py-3
                   focus:outline-none shadow-md text-sm sm:text-base"
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 
                   p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => console.log("Search:", searchQuery)}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
