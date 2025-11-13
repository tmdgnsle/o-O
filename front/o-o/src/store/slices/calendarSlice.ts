import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mypageApi } from "@/features/mypage/api/mypageApi";
import type {
  NodeListResponseArray,
  NodeQueryParams,
} from "@/features/mypage/types/mypage";

// 초기 상태 타입 정의
interface CalendarState {
  calendarNodes: NodeListResponseArray;
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: CalendarState = {
  calendarNodes: [],
  isLoading: false,
  error: null,
};

// 달력형 키워드 조회
export const fetchCalendarNodes = createAsyncThunk(
  "calendar/fetchCalendarNodes",
  async (params: NodeQueryParams) => {
    return await mypageApi.getMyCalendarWorkspace(params);
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarNodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarNodes.fulfilled, (state, action) => {
        state.calendarNodes = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCalendarNodes.rejected, (state, action) => {
        state.error =
          action.error.message || "캘린더 키워드를 불러오는데 실패했습니다";
        state.isLoading = false;
      });
  },
});

export default calendarSlice.reducer;
