// pages/TrendMindmapPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTrend } from "../hooks/useTrend";
import { TrendMindmapHeader } from "../components/TrendMindmap/TrendMindmapHeader";
import { D3Mindmap } from "../components/TrendMindmap/D3Mindmap";
import { TrendExpandKeyword } from "../components/TrendMindmap/TrendExpandKeyword";
import { DrawerButton } from "../components/TrendMindmap/Drawer/DrawerButton";
import type { TrendKeywordItem } from "../types/trend";

export function TrendMindmapPage() {
  const { trendId } = useParams<{ trendId: string }>();
  const { childKeywords, keywordsLoading, keywordsError, fetchChildTrendList } =
    useTrend();
  const [showExpandKeywords, setShowExpandKeywords] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<TrendKeywordItem[]>(
    []
  );

  useEffect(() => {
    if (trendId) {
      const decodedKeyword = decodeURIComponent(trendId);
      fetchChildTrendList(decodedKeyword);
    }
  }, [trendId, fetchChildTrendList]);

  const parentKeyword = trendId ? decodeURIComponent(trendId) : "";

  const handleMoreClick = (remainingKeywords: TrendKeywordItem[]) => {
    setExpandedKeywords(remainingKeywords);
    setShowExpandKeywords((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* 플로팅 헤더 */}
      <div className="fixed top-10 left-10 right-10 z-50">
        <TrendMindmapHeader />
      </div>

      {/* 마인드맵 - 전체 화면 */}
      <div className="absolute inset-0 w-full h-full">
        {keywordsLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">마인드맵을 생성하는 중...</p>
            </div>
          </div>
        ) : keywordsError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2 text-lg">
                ⚠️ 오류가 발생했습니다
              </p>
              <p className="text-gray-600">{keywordsError}</p>
            </div>
          </div>
        ) : (
          <D3Mindmap
            parentKeyword={parentKeyword}
            childKeywords={childKeywords}
            onMoreClick={handleMoreClick}
          />
        )}
      </div>

      {/* 확장 키워드 사이드바 */}
      {showExpandKeywords && (
        <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50">
          <TrendExpandKeyword keywords={expandedKeywords} />
        </div>
      )}

      {/* 드로어 버튼 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <DrawerButton />
      </div>
    </div>
  );
}
