// src/hooks/useGoogleOneTap.ts
import { useCallback, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";

interface UseGoogleOneTapOptions {
  buttonType?: "standard" | "icon"; // 버튼 타입 추가
  elementId?: string; // ID 커스터마이징
}

export function useGoogleOneTap(
  isLoggedIn: boolean,
  options: UseGoogleOneTapOptions = {}
) {
  const { buttonType = "standard", elementId = "googleSignInDiv" } = options;
  const dispatch = useAppDispatch();

  const handleCredentialResponse = useCallback(
    async (response: CredentialResponse) => {
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        const result = await signInWithCredential(auth, credential);
        console.log("로그인 성공:", result.user);

        const userData = {
          googleId: result.user.uid,
          name: result.user.displayName || "사용자",
          email: result.user.email || "",
          profileImage: result.user.photoURL || "",
        };

        dispatch(loginSuccess(userData));
      } catch (error) {
        console.error("로그인 실패:", error);
      }
    },
    [dispatch]
  );

  const initializeOneTap = useCallback(() => {
    if (!globalThis.google) return;

    globalThis.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    const savedUser = localStorage.getItem("user");
    if (!savedUser && !isLoggedIn) {
      globalThis.google.accounts.id.prompt();
    }

    globalThis.google.accounts.id.prompt();

    const element = document.getElementById(elementId);
    if (element && buttonType === "standard") {
      globalThis.google.accounts.id.renderButton(element, {
        theme: "outline", // filled_blue / filled_black / outline
        size: "large", // small / medium / large
        text: "continue_with", // signup_with / continue_with / signin
        shape: "pill", // rectangular / pill / circle
        locale: "ko",
      });
    } else if (element && buttonType === "icon") {
      globalThis.google.accounts.id.renderButton(element, {
        theme: "filled_black",
        size: "large",
        shape: "circle", // 아이콘만
        type: "icon", // 아이콘 타입
      });
    }
  }, [handleCredentialResponse, buttonType, elementId, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) return;

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
  }, [isLoggedIn, initializeOneTap]);

  // 수동으로 팝업 띄우기
  const triggerLogin = useCallback(() => {
    if (globalThis.google) {
      globalThis.google.accounts.id.prompt();
    }
  }, []);

  return { triggerLogin };
}
