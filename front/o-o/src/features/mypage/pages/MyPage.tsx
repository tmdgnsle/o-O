import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.png";
import { IdeaSearchSection } from "../components/IdeaSearchSection";
import { Dashboard } from "../components/Dashboard";
import { useSearchParams } from "react-router-dom";
import { CalendarView } from "../components/Calendar/CalendarView";

export function MyPage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "dashboard";
  const tab = searchParams.get("tab") || "recently-viewed";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="-mb-4 lg:-mb-6">
        <Header />
      </div>
      <IdeaSearchSection />

      {view === "dashboard" ? <Dashboard activeTab={tab} /> : <CalendarView />}
    </div>
  );
}
