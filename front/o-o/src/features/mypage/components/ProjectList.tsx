import { ProjectCard } from "./ProjectCard";

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

interface ProjectListPropos {
  projects: Project[];
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
