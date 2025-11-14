import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrendKeywords } from "@/store/slices/trendSlice";
import { useCallback } from "react";
import type { TrendKeywordItem } from "../types/trend";

interface UseTrendReturn {
  // 상위 키워드
  keywords: TrendKeywordItem[];
  keywordsLoading: boolean;
  keywordsError: string | null;
  fetchTopTrendList: () => void;
}

export const useTrend = (): UseTrendReturn => {
  const dispatch = useAppDispatch();

  // 트렌드 상태
  const { keywords, isLoading, error } = useAppSelector((state) => state.trend);

  // 트렌드 상위 키워드 조회
  const fetchTopTrendList = useCallback(() => {
    dispatch(fetchTrendKeywords());
  }, [dispatch]);

  return {
    // 상위 키워드
    keywords,
    keywordsLoading: isLoading,
    keywordsError: error,
    fetchTopTrendList,
  };
};
