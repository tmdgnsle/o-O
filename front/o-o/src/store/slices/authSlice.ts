import type { User } from "@/shared/types/user";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// 로그인 상태 타입
interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

// 처음 시작할 때 상태
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
};

// Slice 생성 (상태 + 상태를 바꾸는 함수들)
const authSlice = createSlice({
  name: "auth", // 이름
  initialState, // 초기 상태
  reducers: {
    // 로그인 성공했을 때
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;

      // localStorage 에도 저장 (새로고침해도 로그인 유지)
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("token", action.payload.token);
    },
    // 로그아웃 했을 때
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    // 페이지 새로고침 후 복구
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
});

// 다른 파일에서 쓸 수 있게 내보내기
export const { loginSuccess, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
