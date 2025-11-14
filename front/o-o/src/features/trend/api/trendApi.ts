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
};
