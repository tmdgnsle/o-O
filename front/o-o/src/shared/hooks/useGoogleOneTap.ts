// src/hooks/useGoogleOneTap.ts
import { useCallback, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

export function useGoogleOneTap(isLoggedIn: boolean) {
  const initializeOneTap = useCallback(() => {
    if (!globalThis.google) return;
    globalThis.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    globalThis.google.accounts.id.prompt();

    globalThis.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv")!,
      {
        theme: "outline", // filled_blue / filled_black / outline
        size: "large", // small / medium / large
        text: "continue_with", // signup_with / continue_with / signin
        shape: "pill", // rectangular / pill / circle
      }
    );
  }, []); // 의존성 없음 (한 번만 생성)

  useEffect(() => {
    if (isLoggedIn) return; // 이미 로그인한 경우 One Tap 비활성화

    if (globalThis.google) {
      initializeOneTap();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initializeOneTap;
    }
  }, [isLoggedIn, initializeOneTap]); // 의존성 배열에 함수 넣기

  const handleCredentialResponse = async (response: CredentialResponse) => {
    try {
      // Google JWT 토큰을 Firebase 인증으로 변환
      const credential = GoogleAuthProvider.credential(response.credential);
      const result = await signInWithCredential(auth, credential);

      console.log("로그인 성공:", result.user);
      // Redux에 저장 등
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };
}
