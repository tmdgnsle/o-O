import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearChildKeywords,
  fetchChildTrendKeywords,
  fetchTrendKeywords,
} from "@/store/slices/trendSlice";
import { useCallback } from "react";
import type { TrendKeywordItem } from "../types/trend";

interface UseTrendReturn {
  // 상위 키워드
  keywords: TrendKeywordItem[];
  childKeywords: TrendKeywordItem[];
  keywordsLoading: boolean;
  keywordsError: string | null;
  fetchTopTrendList: () => void;
  fetchChildTrendList: (parentKeyword: string) => void;
  clearChildTrendList: () => void;
}

export const useTrend = (): UseTrendReturn => {
  const dispatch = useAppDispatch();

  // 트렌드 상태
  const { keywords, childKeywords, isLoading, error } = useAppSelector(
    (state) => state.trend
  );

  // 트렌드 상위 키워드 조회
  const fetchTopTrendList = useCallback(() => {
    dispatch(fetchTrendKeywords());
  }, [dispatch]);

  // 트렌드 자식 키워드 조회
  const fetchChildTrendList = useCallback(
    (parentKeyword: string) => {
      dispatch(fetchChildTrendKeywords(parentKeyword));
    },
    [dispatch]
  );

  // 자식 키워드 초기화
  const clearChildTrendList = useCallback(() => {
    dispatch(clearChildKeywords());
  }, [dispatch]);

  return {
    // 상위 키워드
    keywords,
    childKeywords,
    keywordsLoading: isLoading,
    keywordsError: error,
    fetchTopTrendList,
    fetchChildTrendList,
    clearChildTrendList,
  };
};
