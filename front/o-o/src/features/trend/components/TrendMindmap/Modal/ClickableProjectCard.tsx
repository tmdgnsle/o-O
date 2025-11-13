import { ProjectCard } from "@/features/mypage/components/ProjectCard/ProjectCard";
import type { Project } from "@/features/trend/types";

interface ClickableProjectCardProps {
  readonly project: Project;
  readonly onClick: (id: string) => void;
}

export function ClickableProjectCard({
  project,
  onClick,
}: ClickableProjectCardProps) {
  return (
    <button onClick={() => onClick(project.id)} className="cursor-pointer">
      <ProjectCard project={project} />
    </button>
  );
}
