import { SearchInput } from "./SearchInput";
import { SearchRecommendSection } from "./SearchRecommendSection";
export function SearchSection() {
  return (
    <section
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div
        className="
        w-full flex flex-col justify-center items-center gap-8 
        translate-y-[20%] 
        "
      >
        <SearchInput />
        <SearchRecommendSection />
      </div>
    </section>
  );
}
