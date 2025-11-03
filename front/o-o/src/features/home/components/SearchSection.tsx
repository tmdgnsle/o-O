import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { SearchRecommendSection } from "./SearchRecommendSection";
import { Button } from "@/components/ui/button";
import LoginPromptModel from "@/shared/ui/LoginPromptModal";
import popo from "@/shared/assets/images/popo_chu.png";

export function SearchSection() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // TODO: 실제 로그인 로직으로 교체
  const isLoggedIn = false;

  const handleKeywordClick = (keyword: string) => {
    setSearchValue(keyword);
    setSelectedKeyword(keyword);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    if (value !== selectedKeyword) {
      setSelectedKeyword(null);
    }
  };

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      console.log("아이디어 생성 로직 실행");
    }
  };

  return (
    <section
      className="w-full h-screen flex flex-col items-center justify-center relative"
      style={{ height: "calc(100vh - 130px)" }}
    >
      <div
        className="
          w-full flex flex-col justify-center items-center gap-16 
          translate-y-[-20%] 
        "
      >
        <div className="w-full flex flex-col justify-center items-center gap-8">
          <SearchInput value={searchValue} onChange={handleInputChange} />
          <SearchRecommendSection
            onKeywordClick={handleKeywordClick}
            selectedKeyword={selectedKeyword}
          />
        </div>
        <Button
          onClick={handleCreateClick}
          variant="outline"
          className="
            rounded-full border-none bg-white/60 
            text-[clamp(13px,1.5vw,24px)]
            font-semibold shadow-md transitional-all duration-300
            hover:bg-primary hover:text-white
          "
          style={{
            paddingLeft: "clamp(1rem, 5vw, 3rem)",
            paddingRight: "clamp(1rem, 5vw, 3rem)",
            paddingTop: "clamp(0.5rem, 2vw, 2rem)",
            paddingBottom: "clamp(0.5rem, 2vw, 2rem)",
          }}
        >
          생성하기
        </Button>
      </div>

      {/* 포포 이미지 - 왼쪽 하단 고정 */}
      <img
        src={popo}
        alt="popo character"
        className="absolute bottom-0 left-8"
        style={{
          width: "clamp(220px, 30vw, 400px)",
          height: "auto",
        }}
      />

      {/* 로그인 모달 */}
      <LoginPromptModel
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
}
