import { useState } from "react";
import Calendar from "@/shared/assets/images/uim_calender.png";
import { useSearchParams } from "react-router-dom";

type TabType = "recently-viewed" | "team-project" | "personal-project";

export function DashboardTabNav() {
  const [activeTab, setActiveTab] = useState<TabType>("recently-viewed");
  const [searchParams, setSearchParam] = useSearchParams();

  const view = searchParams.get("view") || "dashboard";

  const tabs: { id: TabType; label: string }[] = [
    { id: "recently-viewed", label: "Recently viewed" },
    { id: "team-project", label: "Team Project" },
    { id: "personal-project", label: "Personal Project" },
  ];

  const toggleView = () => {
    setSearchParam({ view: view === "dashboard" ? "calendar" : "dashboard" });
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-2 pb-4">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 font-medium transition-colors relative text-black ${
              activeTab === tab.id ? "font-semibold" : "hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button onClick={toggleView} className="transition-colors">
        <img src={Calendar} alt="calendar" className="h-8 w-8" />
      </button>
    </div>
  );
}
