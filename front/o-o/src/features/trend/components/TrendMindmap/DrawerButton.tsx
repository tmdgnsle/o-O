import { useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import { useFullscreen } from "@/shared/hooks/useFullscreen";

export function DrawerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isFullscreen = useFullscreen();

  const expandKeywords = [
    { id: 1, keyword: "소영언니" },
    { id: 2, keyword: "짱짱걸" },
    { id: 3, keyword: "키워드3" },
    { id: 4, keyword: "키워드4" },
    { id: 5, keyword: "키워드5" },
    { id: 6, keyword: "키워드6" },
    { id: 7, keyword: "키워드7" },
    { id: 8, keyword: "키워드8" },
    { id: 9, keyword: "소영언니2" },
    { id: 10, keyword: "짱짱걸2" },
    { id: 11, keyword: "키워드11" },
    { id: 12, keyword: "키워드12" },
    { id: 13, keyword: "키워드13" },
    { id: 14, keyword: "키워드14" },
    { id: 15, keyword: "키워드15" },
    { id: 16, keyword: "키워드16" },
  ];

  // 전체화면일 때 높이 조정
  const drawerHeight = isFullscreen
    ? "h-[12vh] sm:h-[10vh] md:h-[14vh]"
    : "h-[18vh] sm:h-[18vh] md:h-[18vh]";

  const getButtonBottom = () => {
    if (!isOpen) {
      return "bottom-4";
    }

    if (isFullscreen) {
      return "bottom-[calc(12vh+1rem)] sm:bottom-[calc(10vh+1rem)] md:bottom-[calc(14vh+1rem)]";
    }

    return "bottom-[calc(25vh+1rem)] sm:bottom-[calc(20vh+1rem)] md:bottom-[calc(18vh+1rem)]";
  };

  const buttonBottom = getButtonBottom();

  return (
    <div className="relative">
      <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DrawerTrigger asChild>
          <button
            className={`
              bg-[#F6F6F6] 
              border border-[#E5E5E5] 
              rounded-full 
              shadow-md
              hover:shadow-lg
              hover:bg-gray-200
              active:scale-95
              transition-all
              duration-300
              cursor-pointer
              w-9 h-9 
              sm:w-10 sm:h-10 
              md:w-12 md:h-12
              flex items-center justify-center
              fixed
              z-50
              ${buttonBottom}
            `}
            aria-label={isOpen ? "드로어 닫기" : "드로어 열기"}
          >
            {isOpen ? (
              <ArrowDropUpIcon
                sx={{
                  fontSize: { xs: 28, sm: 32, md: 40 },
                  color: "#263A6B",
                }}
              />
            ) : (
              <ArrowDropDownIcon
                sx={{
                  fontSize: { xs: 28, sm: 32, md: 40 },
                  color: "#263A6B",
                }}
              />
            )}
          </button>
        </DrawerTrigger>
        <DrawerContent className={drawerHeight}>
          <div className="w-full max-w-full h-full flex flex-col px-2 sm:px-4 md:px-6">
            {/* 드래그 핸들 */}
            <div className="mx-auto w-8 sm:w-10 md:w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-2 cursor-grab active:cursor-grabbing" />

            {/* 가로 스크롤 영역 */}
            <div className="flex-1 overflow-hidden">
              <CustomScrollbar maxWidth="100%" direction="horizontal">
                <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3 pr-2 items-center">
                  {expandKeywords.map((item, index) => {
                    // 다양한 색상 조합
                    const colors = [
                      { bg: "bg-purple-200/60", blur: "bg-purple-300/40" },
                      { bg: "bg-orange-200/60", blur: "bg-orange-300/40" },
                      { bg: "bg-blue-200/60", blur: "bg-blue-300/40" },
                      { bg: "bg-pink-200/60", blur: "bg-pink-300/40" },
                      { bg: "bg-green-200/60", blur: "bg-green-300/40" },
                      { bg: "bg-yellow-200/60", blur: "bg-yellow-300/40" },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <button
                        key={item.id}
                        className="relative flex-shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200"
                      >
                        {/* 블러 효과 배경 (더 큰 원) */}
                        <div
                          className={`
                            absolute inset-2
                            ${color.blur}
                            rounded-full 
                            blur-sm
                            scale-100
                          `}
                        />

                        {/* 메인 원형 배경 */}
                        <div
                          className={`
                            relative
                            w-20 h-20
                            backdrop-blur-sm
                            rounded-full
                            flex items-center justify-center
                          `}
                        >
                          {/* 텍스트 */}
                          <span
                            className="
                              text-gray-800
                              font-semibold
                              text-sm
                              px-2
                              text-center
                              leading-tight
                            "
                          >
                            {item.keyword}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CustomScrollbar>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
