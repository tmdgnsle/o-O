import { Header } from "@/shared/ui/Header";
import { TrendHeader } from "../components/TrendHeader";
import { TrendKeyword } from "../components/TrendKeyword";

export function TrendPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="-mb-4">
        <Header />
      </div>
      <div className="flex flex-col">
        <div className="md:mx-12 mx-4">
          <TrendHeader />
        </div>
        <div className="flex-1 overflow-hidden">
          <TrendKeyword />
        </div>
      </div>
    </div>
  );
}
