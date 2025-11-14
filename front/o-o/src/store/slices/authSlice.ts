/* 인증 담당 */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  redirectPath: string | null;
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem("accessToken");

  return {
    accessToken: token || null,
    isLoggedIn: !!token,
    redirectPath: null,
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
    // 로그인 버튼 클릭 시 현재 경로 저장
    setRedirectPath: (state, action: PayloadAction<string>) => {
      state.redirectPath = action.payload;
    },
    // 로그인 후 리다이렉트 경로 초기화
    clearRedirectPath: (state) => {
      state.redirectPath = null;
    },
  },
});

export const { setAccessToken, clearAuth, setRedirectPath, clearRedirectPath } =
  authSlice.actions;
export default authSlice.reducer;
