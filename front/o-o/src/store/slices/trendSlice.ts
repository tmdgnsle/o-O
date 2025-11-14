import { trendApi } from "@/features/trend/api/trendApi";
import type { TrendKeywordItem } from "@/features/trend/types/trend";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TrendState {
  keywords: TrendKeywordItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TrendState = {
  keywords: [],
  isLoading: false,
  error: null,
};

export const fetchTrendKeywords = createAsyncThunk(
  "trend/fetchKeywords",
  async () => {
    return await trendApi.getTopTrend();
  }
);

const trendSlice = createSlice({
  name: "trend",
  initialState,
  reducers: {},
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
      });
  },
});

export default trendSlice.reducer;
