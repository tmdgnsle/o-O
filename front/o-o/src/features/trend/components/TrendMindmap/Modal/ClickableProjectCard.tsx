import { ProjectCard } from "@/features/mypage/components/ProjectCard";

interface User {
  id: string;
  name: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
  date: string;
  isPrivate: boolean;
  collaborators: User[];
}

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
