// src/features/auth/pages/CallbackPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { fetchUserInfo } from "../api/authApi";

export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. URL에서 token과 userId 추출
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");

        console.log("📥 Callback 받음:", {
          token,
          userId,
        });

        if (!token) {
          throw new Error("토큰이 없습니다.");
        }

        if (!userId) {
          throw new Error("사용자 ID가 없습니다.");
        }

        // 2. 먼저 accessToken만 Redux에 임시 저장
        //    (axios 인터셉터가 이 토큰을 사용해서 /users 요청)
        dispatch({
          type: "auth/updateAccessToken",
          payload: token,
        });

        console.log("✅ accessToken Redux에 임시 저장");
        console.log("📡 사용자 정보 조회 중...");

        // 3. 사용자 정보 조회
        //    axios 인터셉터가 자동으로 Authorization 헤더에 token 추가
        const user = await fetchUserInfo();

        console.log("✅ 사용자 정보 조회 성공:", user);

        // 4. 최종적으로 Redux에 완전히 저장
        dispatch(
          setCredentials({
            accessToken: token,
            user,
          })
        );

        console.log("✅ 로그인 완료!");
        console.log("🍪 refreshToken은 쿠키에 자동 저장됨");

        // 5. 홈으로 이동
        navigate("/", { replace: true });
      } catch (error: any) {
        console.error("❌ 로그인 실패:", error);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "로그인에 실패했습니다.";
        alert(errorMessage);

        navigate("/login", { replace: true });
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
