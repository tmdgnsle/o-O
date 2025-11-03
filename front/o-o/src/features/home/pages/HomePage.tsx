import { SearchSection } from "../components/SearchSection";
import background from "@/shared/assets/images/home_bg.png";
import { Header } from "@/shared/ui/Header";

export function HomePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      <SearchSection />
    </div>
  );
}
