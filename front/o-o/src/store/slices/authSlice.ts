import type { User } from "@/features/auth/types/user";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// 로그인 상태 타입
interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
}

// localStorage에서 초기값 가져오기
const getInitialState = (): AuthState => {
  const token = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    try {
      return {
        accessToken: token,
        user: JSON.parse(userStr),
        isLoggedIn: true,
      };
    } catch {
      // JSON 파싱 실패 시 초기화
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }

  return {
    accessToken: null,
    user: null,
    isLoggedIn: false,
  };
};
// Slice 생성 (상태 + 상태를 바꾸는 함수들)
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    // 로그인 성공 시 호출
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isLoggedIn = true;

      // localStorage에 저장
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    // accessToken만 업데이트 (refresh 시)
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },

    // 로그아웃 시 호출
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isLoggedIn = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },
});

// 다른 파일에서 쓸 수 있게 내보내기
export const { setCredentials, updateAccessToken, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
