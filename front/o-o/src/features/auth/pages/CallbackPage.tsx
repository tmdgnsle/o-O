// src/features/auth/pages/CallbackPage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setAccessToken } from "@/store/slices/authSlice"; // ✅ 수정
import { fetchUserProfile } from "@/store/slices/userSlice";

export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log("⏭️ 이미 처리됨 - 스킵");
      return;
    }

    const handleCallback = async () => {
      try {
        // 1. URL에서 token과 userId 추출
        // const token = searchParams.get("token");
        const token =
          "eyJhbGciOiJIUzI1NiJ9.eyJjYXRlZ29yeSI6ImFjY2VzcyIsInVzZXJJZCI6NCwicm9sZSI6IlVTRVIiLCJwbGF0Zm9ybSI6IndlYiIsImlhdCI6MTc2Mjk1MjQzNSwiZXhwIjoxNzYyOTUyNjE1fQ.w89uGzGTgTy1WnUsav4rzo6cYrdwho5sTC9AwxI0Uso";
        const userId = searchParams.get("userId");

        console.log("📥 Callback 받음:", { token, userId });

        if (!token) {
          throw new Error("토큰이 없습니다.");
        }

        if (!userId) {
          throw new Error("사용자 ID가 없습니다.");
        }

        hasProcessed.current = true;

        // 2. accessToken을 authSlice에 저장
        dispatch(setAccessToken(token)); // ✅ 수정
        console.log("✅ accessToken Redux에 저장");

        // 3. 사용자 정보 조회 (userSlice에 자동 저장됨)
        console.log("📡 사용자 정보 조회 중...");
        const resultAction = await dispatch(fetchUserProfile());

        if (fetchUserProfile.fulfilled.match(resultAction)) {
          console.log("✅ 사용자 정보 조회 성공:", resultAction.payload);
          console.log("✅ 로그인 완료!");
          console.log("🍪 refreshToken은 쿠키에 자동 저장됨");
        } else {
          throw new Error("사용자 정보 조회 실패");
        }

        // 4. 홈으로 이동
        navigate("/", { replace: true });
      } catch (error: any) {
        console.error("❌ 로그인 실패:", error);

        if (error.response) {
          console.error("📡 서버 응답 상태:", error.response.status);
          console.error("📨 서버 응답 데이터:", error.response.data);
        } else if (error.request) {
          console.error("📭 요청은 갔지만 응답 없음:", error.request);
        } else {
          console.error("⚙️ 요청 설정 중 오류:", error.message);
        }

        navigate("/", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            로그인 처리 중...
          </p>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return null;
}
