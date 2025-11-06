import { useEffect, useState } from "react";
import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "./DashboardTabNav";
import popo from "@/shared/assets/images/popo_chu.png";
import { MarblesView } from "./MarblesView";

export function CalendarView() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDateKeywords, setSelectedDateKeywords] = useState<
    Array<{ keyword: string; mindmapId: string }>
  >([]);

  useEffect(() => {
    const checkFullscreen = () => {
      // window.innerHeight와 screen.height가 거의 같으면 전체화면
      // 오차범위 50px 정도 허용
      const heightDiff = Math.abs(window.innerHeight - window.screen.height);
      const widthDiff = Math.abs(window.innerWidth - window.screen.width);

      setIsFullscreen(heightDiff < 50 && widthDiff < 50);
    };

    checkFullscreen();

    // 윈도우 크기 변경 감지
    window.addEventListener("resize", checkFullscreen);

    return () => {
      window.removeEventListener("resize", checkFullscreen);
    };
  }, []);

  const handleDateClick = (
    keywords: Array<{ keyword: string; mindmapId: string }>
  ) => {
    setSelectedDateKeywords(keywords);
  };

  return (
    <div
      className="mx-4 sm:mx-8 lg:mx-12 px-4 sm:px-5 lg:px-7 mt-5 bg-white/60 rounded-3xl relative 
                    h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-212px)]"
    >
      <div className="absolute z-10 right-3 top-3 sm:right-5 sm:top-5">
        <DashboardTabNav />
      </div>

      <div className="flex flex-col lg:flex-row justify-between h-full lg:gap-4 gap-0 py-2 lg:py-0">
        {/* lg (1024px) 이상에서만 flex-row */}

        {/* 왼쪽: 캘린더 영역 */}
        <div className="lg:flex-[0_0_auto] w-full lg:w-auto relative flex justify-center lg:justify-start flex-shrink-0">
          <CalendarDetail onDateClick={handleDateClick} />
          {isFullscreen && (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-0 hidden lg:block"
              style={{
                width: "clamp(220px, 30vw, 350px)",
                height: "auto",
              }}
            />
          )}
        </div>

        {/* 오른쪽: Marbles 영역 */}
        <div className="flex-1 overflow-hidden min-h-[200px] lg:min-h-0">
          <MarblesView keywords={selectedDateKeywords} />
        </div>
      </div>
    </div>
  );
}
