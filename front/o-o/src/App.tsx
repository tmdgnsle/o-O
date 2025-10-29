import { Routes, Route } from "react-router-dom";
import { Header } from "./shared/ui/Header";
import background from "@/shared/assets/images/home_bg.png";
import "./index.css";

// 임시 페이지 컴포넌트들
function HomePage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function TrendPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function NewProjectPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trend" element={<TrendPage />} />
        <Route path="/new-project" element={<NewProjectPage />} />
      </Routes>
    </div>
  );
}

export default App;
