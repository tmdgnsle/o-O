// src/components/SessionRestorer.tsx
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { restoreSession } from "@/store/slices/authSlice";

export function SessionRestorer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // localStorage에서 저장된 유저 정보 가져오기
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        // Redux에 복구
        dispatch(restoreSession({ user, token: savedToken }));
        console.log("세션 복구 완료:", user);
      } catch (error) {
        console.error("세션 복구 실패:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch]);

  return null; // UI 없음
}
