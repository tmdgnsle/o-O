import AppRouter from '@/app/AppRouter';
import "./index.css";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home/pages/HomePage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOneTapHandler } from "./shared/components/GoogleOneTapHandler";

function TrendPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function NewProjectPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function App() {
  const isLoggedIn = false; // TODO: Redux 에서 가져오기

  return (
    // <AppRouter />
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleOneTapHandler isLoggedIn={isLoggedIn} />
      <div className="font-paperlogy">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trend" element={<TrendPage />} />
          <Route path="/new-project" element={<NewProjectPage />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
