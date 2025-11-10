import AppRouter from "@/app/AppRouter";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOneTapHandler } from "./shared/components/GoogleOneTapHandler";
import { useAppSelector } from "./store/hooks";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { SessionRestorer } from "./shared/components/SessionRestorer";

// redux 사용하는 내부 컴포넌트
function AppContent() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn); // Redux에서 가져오기

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <SessionRestorer />
      <GoogleOneTapHandler isLoggedIn={isLoggedIn} />
      <div className="font-paperlogy">
        <AppRouter />
      </div>
    </GoogleOAuthProvider>
  );
}

// 최상위 컴포넌트
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
