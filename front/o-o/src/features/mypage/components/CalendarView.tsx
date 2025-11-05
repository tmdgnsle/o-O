import { useEffect, useState } from "react";
import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "./DashboardTabNav";
import popo from "@/shared/assets/images/popo_chu.png";

export function CalendarView() {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="mx-12 px-7 mt-5 bg-white/60 rounded-3xl relative h-[calc(100vh-212px)]">
      <div className="absolute z-10 right-5 top-5">
        <DashboardTabNav />
      </div>
      <CalendarDetail />
      {isFullscreen && (
        <img
          src={popo}
          alt="popo character"
          className="absolute bottom-0 left-5"
          style={{
            width: "clamp(220px, 30vw, 350px)",
            height: "auto",
          }}
        />
      )}
    </div>
  );
}
