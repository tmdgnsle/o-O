import { Header } from "@/shared/ui/Header";
import { TrendHeader } from "../components/TrendMain/TrendHeader";
import { TrendKeyword } from "../components/TrendMain/TrendKeyword";
import { useEffect } from "react";
import { useTrend } from "../hooks/useTrend";

export function TrendPage() {
  const { keywords, keywordsError, keywordsLoading, fetchTopTrendList } =
    useTrend();

  // 페이지 진입 시 상위 키워드 조회
  useEffect(() => {
    fetchTopTrendList();
  }, [fetchTopTrendList]);

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
          <TrendKeyword
            keywords={keywords}
            keywordsError={keywordsError}
            keywordsLoading={keywordsLoading}
          />
        </div>
      </div>
    </div>
  );
}
