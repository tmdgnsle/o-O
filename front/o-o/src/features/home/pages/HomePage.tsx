import { SearchSection } from "../components/SearchSection";
import background from "@/shared/assets/images/home_bg.png";
import { Header } from "@/shared/ui/Header";

export function HomePage() {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      <SearchSection />
    </div>
  );
}
