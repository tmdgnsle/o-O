import Calendar from "@/shared/assets/images/uim_calender.png";
import Dashboard from "@/shared/assets/images/MdDashboard.png";
import { useSearchParams } from "react-router-dom";

type TabType = "recently-viewed" | "team-project" | "personal-project";

export function DashboardTabNav() {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") || "dashboard";
  const activeTab = searchParams.get("tab") || "recently-viewed";

  const tabs: { id: TabType; label: string }[] = [
    { id: "recently-viewed", label: "Recently viewed" },
    { id: "team-project", label: "Team Project" },
    { id: "personal-project", label: "Personal Project" },
  ];

  const handleTabChange = (tabId: TabType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tabId);
    if (view === "calendar") {
      newParams.set("view", "dashboard");
    }
    setSearchParams(newParams);
  };

  const toggleView = () => {
    if (view === "dashboard") {
      setSearchParams({ view: "calendar" });
    } else {
      setSearchParams({ view: "dashboard" });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-2">
      {view === "dashboard" && (
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-2 font-medium transition-colors relative text-black ${
                activeTab === tab.id ? "font-semibold" : "hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {view === "calendar" && <div />}

      <button onClick={toggleView} className={"p-2 rounded-lg"}>
        {view === "calendar" ? (
          <img src={Dashboard} alt="dashboard" className="w-8 h-8" />
        ) : (
          <img src={Calendar} alt="calendar" className="h-8 w-8" />
        )}
      </button>
    </div>
  );
}
