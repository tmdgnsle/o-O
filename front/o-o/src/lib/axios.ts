import axios from "axios";
import { clearAuth } from "@/store/slices/authSlice";
import { clearUser } from "@/store/slices/userSlice";

/* Redux store를 axios 설정 내부에서 직접 import 하지 않기 위해 사용되는 패턴 */

// store 나중에 주입받기 위한 변수
let store: any;

// setter역할
export const injectStore = (_store: any) => {
  store = _store;
};

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 쿠키(refreshToken) 자동 전송 (브라우저가 쿠키를 자동으로 붙여서 서버로 전달)
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: accessToken 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    if (store) {
      const token = store.getState().auth.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // API 호출할 때 자동으로 헤더에 token 넣어놓도록 처리
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refreshToken(쿠키)으로 새 accessToken 받기
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/reissue`,
          {},
          { withCredentials: true }
        );

        // Redux 업데이트
        if (store) {
          store.dispatch({
            type: "auth/setAccessToken",
            payload: data.accessToken,
          });
        }

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // refresh 실패 = 로그아웃
        console.error("❌ Refresh Token 만료 - 로그아웃 처리");

        if (store) {
          store.dispatch(clearAuth());
          store.dispatch(clearUser());
        }
        // globalThis.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
