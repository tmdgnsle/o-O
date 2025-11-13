import type { Project } from "../../types/project";
import { ProjectCard } from "./ProjectCard";
interface ProjectListPropos {
  readonly projects: Project[];
}

export function ProjectList({ projects }: ProjectListPropos) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        프로젝트가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
