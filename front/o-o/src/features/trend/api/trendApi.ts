import { apiClient } from "@/lib/axios";
import type { TrendKeywordResponse } from "../types/trend";

export const trendApi = {
  // GET /trend/top
  getTopTrend: async (): Promise<TrendKeywordResponse> => {
    const { data } = await apiClient.get<TrendKeywordResponse>(
      "/trend/top",
      {}
    );

    return data;
  },

  // GET /trend/{parentKeyword}
  getChildTrend: async (
    parentKeyword: string
  ): Promise<TrendKeywordResponse> => {
    const { data } = await apiClient.get<TrendKeywordResponse>(
      `/trend/${parentKeyword}`,
      {}
    );

    return data;
  },

  // GET /trend/search?keyword=검색어
  getSearchKeywordTrend: async (
    keyword: string
  ): Promise<TrendKeywordResponse> => {
    if (!keyword.trim()) {
      console.warn("⚠️ 검색어가 비어있습니다.");
      return {
        period: "",
        parentKeyword: null,
        totalCount: 0,
        items: [],
      };
    }

    const { data } = await apiClient.get<TrendKeywordResponse>(
      "/trend/search",
      {
        params: {
          keyword: keyword.trim(),
        },
      }
    );

    return data;
  },
};
