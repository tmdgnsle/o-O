import { SearchSection } from "../components/SearchSection";
import popo_chu from "@/shared/assets/images/popo_chu.png";
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
      {/* <img
        src={popo_chu}
        alt="popo_chu_character"
        className="absolute left-20 bottom-20 w-80 h-80"
      /> */}
    </div>
  );
}
