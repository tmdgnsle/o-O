import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "./SearchInput";
import { SearchRecommendSection } from "./SearchRecommendSection";
import { Button } from "@/components/ui/button";
import LoginPromptModel from "@/shared/ui/LoginPromptModal";
import popo from "@/shared/assets/images/popo_chu.png";
import { useAppSelector } from "@/store/hooks";

export function SearchSection() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    if (isLoginModalOpen && globalThis.google?.accounts?.id) {
      // 약간의 딜레이 후에 One Tap 프롬프트 표시
      setTimeout(() => {
        globalThis.google?.accounts.id.prompt();
      }, 300);
    }
  }, [isLoginModalOpen]);

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
    if (isLoggedIn) {
      navigate("/new-project");
    } else {
      setIsLoginModalOpen(true);
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
        <Button onClick={handleCreateClick} variant="primary" size="responsive">
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
