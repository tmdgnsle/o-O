import { useGoogleOneTap } from "@/shared/hooks/useGoogleOneTap";

interface Props {
  isLoggedIn: boolean;
}

export function GoogleOneTapHandler({ isLoggedIn }: Props) {
  useGoogleOneTap(isLoggedIn);
  return null; // UI 없음 — hook 실행 전용
}
