import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "./DashboardTabNav";

export function CalendarView() {
  return (
    <div className="mx-12 px-7 mt-5 bg-white/60 rounded-3xl relative">
      <div className="absolute z-10 right-5 top-5">
        <DashboardTabNav />
      </div>
      <CalendarDetail />
    </div>
  );
}
