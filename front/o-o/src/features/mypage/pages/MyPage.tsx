import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.webp";
import { Dashboard } from "../components/Dashboard";
import { useSearchParams } from "react-router-dom";
import { CalendarView } from "../components/Calendar/CalendarView";
import { useMypage } from "../hooks/useMypage";
import { useEffect } from "react";
import { useFullscreen } from "@/shared/hooks/useFullscreen";

export function MyPage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "dashboard";
  const tab = searchParams.get("tab") || "recently-viewed";

  const {
    workspaces,
    isLoading,
    error,
    loadMore,
    hasNext,
    fetchWorkspacesList,
    activeDates,
    activeDaysLoading,
    activeDaysError,
    fetchActiveDaysList,
    keywords,
    keywordsLoading,
    keywordsError,
    fetchKeywordsList,
  } = useMypage();

  console.log("MyPage - view:", view);
  console.log("MyPage - activeDates:", activeDates);
  console.log("MyPage - activeDaysLoading:", activeDaysLoading);
  console.log("MyPage - activeDaysError:", activeDaysError);

  const isFullscreen = useFullscreen();

  useEffect(() => {
    // tab 값에 따라 category 매핑
    let category: "recent" | "team" | "personal" = "recent";

    if (tab === "recently-viewed") {
      category = "recent";
    } else if (tab === "team-project") {
      category = "team";
    } else if (tab === "personal-project") {
      category = "personal";
    }

    fetchWorkspacesList({ category });
  }, [tab, fetchWorkspacesList]); // tab이 바뀔 때마다 다시 호출

  // 캘린더 데이터 조회
  useEffect(() => {
    if (view === "calendar") {
      console.log("🔥 캘린더 뷰 - fetchActiveDaysList 호출");
      // 이번 달의 활성 날짜 조회 (기본값 사용)
      fetchActiveDaysList();
    }
  }, [view, fetchActiveDaysList]);

  return (
    <div
      className="w-screen h-screen flex flex-col bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="-mb-2 lg:-mb-5 ">
        <Header />
      </div>

      <div className="flex justify-center items-start flex-1">
        {view === "dashboard" ? (
          <Dashboard
            workspaces={workspaces}
            isLoading={isLoading}
            error={error}
            isFullscreen={isFullscreen}
            hasNext={hasNext}
            onLoadMore={loadMore}
          />
        ) : (
          <CalendarView
            activeDates={activeDates}
            activeDaysLoading={activeDaysLoading}
            activeDaysError={activeDaysError}
            keywords={keywords}
            keywordsLoading={keywordsLoading}
            keywordsError={keywordsError}
            onDateSelect={fetchKeywordsList}
            onMonthChange={fetchActiveDaysList}
            isFullscreen={isFullscreen}
          />
        )}
      </div>
    </div>
  );
}
