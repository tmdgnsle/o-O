import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.png";
import { IdeaSearchSection } from "../components/IdeaSearchSection";

export function MyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      <IdeaSearchSection />
    </div>
  );
}
