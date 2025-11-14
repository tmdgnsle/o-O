import axios from "axios";
import { API_BASE_URL } from "@/constants/baseUrl";
import { clearAuth } from "@/store/slices/authSlice";
import { clearUser } from "@/store/slices/userSlice";

/* Redux store를 axios 설정 내부에서 직접 import 하지 않기 위해 사용되는 패턴 */

// store 나중에 주입받기 위한 변수
let store: any;

// setter역할
export const injectStore = (_store: any) => {
  store = _store;
};

// axios 인스턴스 생성 (인터셉터 없음 - reissue 요청용)
const axiosPlain = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// axios 인스턴스 생성 (인터셉터 있음)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
        config.headers.Authorization = `Bearer ${token}`;
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
      console.error("4️⃣ AccessToken 만료");

      try {
        console.log(
          "🔄 Reissue 요청 시작:",
          `${API_BASE_URL}/auth/reissue`
        );

        // refreshToken(쿠키)으로 새 accessToken 받기
        const { data } = await axiosPlain.post("/auth/reissue", {});

        // accessToken이 없으면 에러 throw
        if (!data?.accessToken) {
          throw new Error("reissue 응답으로 data (AccessToken)이 안 왔음!!");
        }

        console.log("✅ Reissue 성공:", data);

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

        globalThis.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
