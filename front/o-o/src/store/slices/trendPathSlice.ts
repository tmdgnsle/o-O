import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface TrendPathState {
  visitPath: string[];
}

const initialState: TrendPathState = {
  visitPath: [],
};

const trendPathSlice = createSlice({
  name: "trendPath",
  initialState,
  reducers: {
    // 새 키워드 추가
    addToPath: (state, action: PayloadAction<string>) => {
      const keyword = action.payload;
      // 이미 존재하는 키워드면 그 이후 경로 제거 (역사 추적)
      const existingIndex = state.visitPath.indexOf(keyword);
      if (existingIndex == -1) {
        state.visitPath.push(keyword);
      } else {
        state.visitPath = state.visitPath.slice(0, existingIndex + 1);
      }
    },
    // 전체 경로 설정
    setPath: (state, action: PayloadAction<string[]>) => {
      state.visitPath = action.payload;
    },
    // 경로 초기화
    resetPath: (state) => {
      state.visitPath = [];
    },
    // 부모 노드만 남기고 나머지 삭제
    resetPathExceptParent: (state, action: PayloadAction<string>) => {
      state.visitPath = [action.payload];
    },
  },
});

export const { addToPath, setPath, resetPath, resetPathExceptParent } =
  trendPathSlice.actions;
export default trendPathSlice.reducer;
