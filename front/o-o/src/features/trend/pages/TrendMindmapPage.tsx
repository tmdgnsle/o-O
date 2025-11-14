// pages/TrendMindmapPage.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTrend } from "../hooks/useTrend";
import { TrendMindmapHeader } from "../components/TrendMindmap/TrendMindmapHeader";
import { D3Mindmap } from "../components/TrendMindmap/D3Mindmap";
import { TrendExpandKeyword } from "../components/TrendMindmap/TrendExpandKeyword";
import { DrawerButton } from "../components/TrendMindmap/Drawer/DrawerButton";
import type { TrendKeywordItem } from "../types/trend";

export function TrendMindmapPage() {
  const { trendId } = useParams<{ trendId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { childKeywords, keywordsLoading, keywordsError, fetchChildTrendList } =
    useTrend();
  const [showExpandKeywords, setShowExpandKeywords] = useState(false);
  const [expandedKeywords, setExpandedKeywords] = useState<TrendKeywordItem[]>(
    []
  );

  // 방문 경로 저장 (예: ["알고리즘", "파이썬", "머신러닝"])
  const [visitPath, setVisitPath] = useState<string[]>([]);

  useEffect(() => {
    if (trendId) {
      const decodedKeyword = decodeURIComponent(trendId);
      fetchChildTrendList(decodedKeyword);

      // 새로운 키워드를 클릭한 경우 또는 처음 페이지 진입 시
      // location.state에서 경로 정보를 가져오거나 새로 시작
      if (location.state?.parentPath) {
        // 이전 경로에 현재 키워드 추가
        setVisitPath([...location.state.parentPath, decodedKeyword]);
      } else {
        // 새로운 경로 시작
        setVisitPath([decodedKeyword]);
      }
    }
  }, [trendId, fetchChildTrendList, location.state]);

  const parentKeyword = trendId ? decodeURIComponent(trendId) : "";

  const handleMoreClick = (remainingKeywords: TrendKeywordItem[]) => {
    setExpandedKeywords(remainingKeywords);
    setShowExpandKeywords((prev) => !prev);
  };

  // 자식 노드 클릭 핸들러
  const handleNodeClick = (keyword: string) => {
    // 새로운 경로 정보와 함께 네비게이트
    navigate(`/trend/${encodeURIComponent(keyword)}`, {
      state: {
        parentPath: visitPath, // 현재까지의 방문 경로 전달
      },
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* 플로팅 헤더 */}
      <div className="fixed top-10 left-10 right-10 z-50">
        <TrendMindmapHeader />
      </div>

      {/* 경로 표시 (디버깅용, 필요시 제거) */}
      <div className="fixed top-24 left-10 z-40 bg-white p-2 rounded shadow text-sm">
        <p className="text-gray-600">경로: {visitPath.join(" > ")}</p>
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
            onNodeClick={handleNodeClick}
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
