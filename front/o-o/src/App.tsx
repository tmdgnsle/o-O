import AppRouter from '@/app/AppRouter';
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOneTapHandler } from "./shared/components/GoogleOneTapHandler";

function App() {
  const isLoggedIn = false; // TODO: Redux 에서 가져오기

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleOneTapHandler isLoggedIn={isLoggedIn} />
      <div className="font-paperlogy">
        <AppRouter />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
