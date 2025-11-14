/* 인증 담당 */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  redirectPath: string | null;
  redirectState: any;
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem("accessToken");

  return {
    accessToken: token || null,
    isLoggedIn: !!token,
    redirectPath: null,
    redirectState: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("accessToken", action.payload);
    },

    clearAuth: (state) => {
      state.accessToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
    },

    // 로그인 필요 액션 발생 시 - 현재 경로와 상태 저장
    setLoginRequired: (
      state,
      action: PayloadAction<{ path: string; state?: any }>
    ) => {
      state.redirectPath = action.payload.path;
      state.redirectState = action.payload.state;
    },
    // 로그인 후 리다이렉트 정보 초기화
    clearLoginRequired: (state) => {
      state.redirectPath = null;
      state.redirectState = null;
    },
  },
});

export const {
  setAccessToken,
  clearAuth,
  setLoginRequired,
  clearLoginRequired,
} = authSlice.actions;
export default authSlice.reducer;
