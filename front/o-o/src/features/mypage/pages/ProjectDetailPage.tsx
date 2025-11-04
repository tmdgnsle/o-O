import { Header } from "@/shared/ui/Header";
import background from "@/shared/assets/images/mypage_bg.png";
import { useParams } from "react-router-dom";
import { ProjectDetailCard } from "../components/ProjectDetailCard";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="-mb-4">
        <Header />
      </div>
      <ProjectDetailCard />
    </div>
  );
}
