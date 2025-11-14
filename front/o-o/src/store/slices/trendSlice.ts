import { trendApi } from "@/features/trend/api/trendApi";
import type { TrendKeywordItem } from "@/features/trend/types/trend";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TrendState {
  keywords: TrendKeywordItem[];
  childKeywords: TrendKeywordItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TrendState = {
  keywords: [],
  childKeywords: [],
  isLoading: false,
  error: null,
};

// 인기 키워드 조회
export const fetchTrendKeywords = createAsyncThunk(
  "trend/fetchKeywords",
  async () => {
    return await trendApi.getTopTrend();
  }
);

// 자식 키워드 조회
export const fetchChildTrendKeywords = createAsyncThunk(
  "trend/fetchChildKeywords",
  async (parentKeyword: string) => {
    return await trendApi.getChildTrend(parentKeyword);
  }
);

// 키워드 검색
export const searchTrendKeywords = createAsyncThunk(
  "trend/searchKeywords",
  async (keyword: string, { getState, rejectWithValue }) => {
    try {
      console.log("🔍 키워드 검색 중:", keyword);
      const response = await trendApi.getSearchKeywordTrend(keyword);
      console.log("✅ 키워드 검색 성공:", response);
      console.log("📊 전체 결과 개수:", response.items.length);

      if (response.items.length === 0) {
        return rejectWithValue(`"${keyword}"에 대한 검색 결과가 없습니다.`);
      }

      // 정확히 일치하는 1개인 경우만 반환
      if (
        response.items.length === 1 &&
        response.items[0].keyword === keyword
      ) {
        console.log("✅ 정확한 일치 - keywords 업데이트");
        return {
          ...response,
          items: response.items,
          isExactMatch: true, // ✅ 플래그 추가
        };
      }

      // 5개 이상인 경우 상위 5개 반환
      if (response.items.length > 5) {
        console.log("✂️ 결과를 5개로 제한 - keywords 업데이트");
        return {
          ...response,
          items: response.items.slice(0, 5),
          isExactMatch: false,
        };
      }

      // 2-5개이면서 정확한 일치 아님 → 현재 keywords 반환 (변화 없음)
      console.log("❌ 2-5개 결과 + 정확한 일치 없음 - 원래 keywords 유지");
      const state = getState() as { trend: TrendState };
      return {
        ...response,
        items: state.trend.keywords,
        isExactMatch: false,
      };
    } catch (error: any) {
      console.error("❌ 키워드 검색 실패:", error);
      const message = error.response?.data?.message || "검색에 실패했습니다.";
      return rejectWithValue(message);
    }
  }
);

const trendSlice = createSlice({
  name: "trend",
  initialState,
  reducers: {
    clearChildKeywords: (state) => {
      state.childKeywords = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 인기 키워드 조회
      .addCase(fetchTrendKeywords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendKeywords.fulfilled, (state, action) => {
        state.keywords = action.payload.items;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchTrendKeywords.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || "인기 키워드를 불러오는데 실패했습니다.";
      })
      // 자식 키워드 조회
      .addCase(fetchChildTrendKeywords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildTrendKeywords.fulfilled, (state, action) => {
        state.childKeywords = action.payload.items;
        state.isLoading = false;
      })
      .addCase(fetchChildTrendKeywords.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || "자식 키워드를 불러오는데 실패했습니다.";
      })
      // 키워드 검색
      .addCase(searchTrendKeywords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTrendKeywords.fulfilled, (state, action) => {
        state.keywords = action.payload.items;
        state.isLoading = false;
        state.error = null; // ✅ 모든 경우 에러 초기화
      })
      .addCase(searchTrendKeywords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChildKeywords } = trendSlice.actions;
export default trendSlice.reducer;
