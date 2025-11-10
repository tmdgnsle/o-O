import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // URL에서 토큰과 유저 정보 가져오기
    // 예: /auth/callback?token=xxx&name=홍길동&email=...
    const token = searchParams.get("token");
    const googleId = searchParams.get("googleId");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const profileImage = searchParams.get("profileImage");

    if (token && googleId && name && email) {
      try {
        const user = {
          googleId,
          name,
          email,
          profileImage: profileImage || "",
        };

        // Redux에 저장
        dispatch(loginSuccess({ user, token }));

        console.log("로그인 성공:", user);

        // 홈으로 이동
        navigate("/", { replace: true });
      } catch (error) {
        console.error("로그인 콜백 처리 실패:", error);
        alert("로그인에 실패했습니다.");
        navigate("/", { replace: true });
      }
    } else {
      console.error("필수 파라미터 누락:", { token, googleId, name, email });
      alert("로그인 정보가 올바르지 않습니다.");
      navigate("/", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <p className="mt-6 text-lg text-gray-600 font-medium">
          로그인 처리 중...
        </p>
      </div>
    </div>
  );
}
