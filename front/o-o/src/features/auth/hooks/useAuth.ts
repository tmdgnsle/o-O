// src/features/auth/api/useLogout.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/authSlice";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // Redux 초기화
      dispatch(clearCredentials());

      // TanStack Query 캐시 전체 초기화
      queryClient.clear();

      console.log("✅ 로그아웃 성공");

      // 로그인 페이지로 이동
      navigate("/login");
    },

    onError: (error) => {
      console.error("❌ 로그아웃 실패:", error);
    },
  });
};
