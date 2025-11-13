import { useState } from "react";
import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "../DashboardTabNav";
import popo from "@/shared/assets/images/popo_chu.png";
import { MarblesView } from "../MarblesView";
import type { NodeListResponseArray } from "../../types/mypage";

interface CalenderViewProps {
  readonly isFullscreen?: boolean;
  readonly calendarNodes: NodeListResponseArray;
  readonly isLoading: boolean;
}

export function CalendarView({
  isFullscreen = false,
  calendarNodes,
  isLoading,
}: CalenderViewProps) {
  const [selectedDateKeywords, setSelectedDateKeywords] = useState<
    Array<{ keyword: string; mindmapId: string }>
  >([]);

  console.log("전체화면 감지: ", isFullscreen);
  const containerStyle = isFullscreen
    ? "w-[95vw] h-[82vh] pt-1 bg-white/60 rounded-3xl"
    : "w-[93vw] h-[88vh] sm:h-[83vh] lg:h-[78vh] bg-white/60 rounded-3xl";

  const handleDateClick = (
    keywords: Array<{ keyword: string; mindmapId: string }>
  ) => {
    setSelectedDateKeywords(keywords);
  };

  // 로딩 중일 때 UI 처리
  if (isLoading) {
    return (
      <div className={`${containerStyle} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-gray-500">캘린더 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerStyle} bg-white/60 rounded-3xl relative flex flex-col`}
    >
      {" "}
      <div className="absolute z-10 right-3 top-3 sm:right-5 sm:top-5">
        <DashboardTabNav />
      </div>
      <div className="flex flex-col sm:flex-row justify-between h-full py-2 lg:py-0">
        {/* lg (1024px) 이상에서만 flex-row */}

        {/* 왼쪽: 캘린더 영역 */}
        <div className="w-auto relative flex justify-start flex-shrink-0">
          <CalendarDetail
            calendarNodes={calendarNodes}
            onDateClick={handleDateClick}
            isFullscreen={isFullscreen}
          />

          {isFullscreen ? (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-0 h-[360px] hidden sm:block"
            />
          ) : (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-3 hidden sm:block"
              style={{
                width: "clamp(25px, 100vw, 250px)",
                height: "auto",
              }}
            />
          )}
        </div>

        {/* 오른쪽: Marbles 영역 */}
        <div className="flex-1 overflow-hidden">
          <MarblesView keywords={selectedDateKeywords} />
        </div>
      </div>
    </div>
  );
}
