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

const trendSlice = createSlice({
  name: "trend",
  initialState,
  reducers: {
    clearChildKeywords: (state) => {
      state.childKeywords = [];
    },
  },
  extraReducers: (builder) => {
    builder
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
      // Child Keywords
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
      });
  },
});

export const { clearChildKeywords } = trendSlice.actions;
export default trendSlice.reducer;
