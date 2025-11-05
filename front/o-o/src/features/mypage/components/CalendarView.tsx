import { useEffect, useState } from "react";
import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "./DashboardTabNav";
import popo from "@/shared/assets/images/popo_chu.png";
import { MarblesView } from "./MarblesView";

export function CalendarView() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDateKeywords, setSelectedDateKeywords] = useState<string[]>(
    []
  );

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

  const handleDateClick = (keywords: string[]) => {
    setSelectedDateKeywords(keywords);
  };

  return (
    <div className="mx-12 px-7 mt-5 bg-white/60 rounded-3xl relative h-[calc(100vh-212px)]">
      <div className="absolute z-10 right-5 top-5">
        <DashboardTabNav />
      </div>

      <div className="flex justify-between h-full gap-4">
        {/* 왼쪽: 캘린더 영역 */}
        <div className="flex-2 relative">
          <CalendarDetail onDateClick={handleDateClick} />
          {isFullscreen && (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-0"
              style={{
                width: "clamp(220px, 30vw, 350px)",
                height: "auto",
              }}
            />
          )}
        </div>

        {/* 오른쪽: Marbles 영역 */}
        <div className="flex-1 h-full">
          <MarblesView keywords={selectedDateKeywords} />
        </div>
      </div>
    </div>
  );
}
