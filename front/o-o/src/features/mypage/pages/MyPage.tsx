import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.png";

export function MyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
    </div>
  );
}
