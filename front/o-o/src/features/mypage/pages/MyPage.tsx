import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.png";
import { IdeaSearchSection } from "../components/IdeaSearchSection";
import { Dashboard } from "../components/Dashboard";
import { useSearchParams } from "react-router-dom";
import { CalendarView } from "../components/Calendar/CalendarView";
import { useMypage } from "../hooks/useMypage";
import { useEffect } from "react";

export function MyPage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "dashboard";
  const tab = searchParams.get("tab") || "recently-viewed";

  const { workspaces, isLoading, error, fetchWorkspacesList } = useMypage();

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

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="-mb-4 lg:-mb-6">
        <Header />
      </div>
      <IdeaSearchSection />

      {view === "dashboard" ? (
        <Dashboard
          workspaces={workspaces}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <CalendarView />
      )}
    </div>
  );
}
