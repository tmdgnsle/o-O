import { Header } from "@/shared/ui/Header";
import { TrendHeader } from "../components/TrendHeader";
import { TrendKeyword } from "../components/TrendKeyword";

export function TrendPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="-mb-4">
        <Header />
      </div>
      <div className="flex flex-col mx-16 gap-2 flex-1">
        <TrendHeader />
        <div className="flex-1 min-h-0">
          <TrendKeyword />
        </div>
      </div>
    </div>
  );
}
