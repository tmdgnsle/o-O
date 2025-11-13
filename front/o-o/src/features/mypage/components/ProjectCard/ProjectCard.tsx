import { Avatar } from "@/components/ui/avatar";
import Mindmap from "@/shared/assets/images/basic_bg.png";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import type { Project } from "@/features/mypage/types/project";

interface ProjectCardProps {
  readonly project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const displayCollaborators = project.collaborators.slice(0, 3);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/mindmap/${project.id}`, {
      state: { project },
    });
  };

  return (
    <button
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer relative"
    >
      {/* 오른쪽 상단 아이콘들 */}
      <div className="absolute top-2 right-1 flex gap-2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-md flex gap-1">
          {/* 좌물쇠 */}
          {project.isPrivate ? (
            <LockOutlineIcon sx={{ fontSize: 20, color: "#263A6B" }} />
          ) : (
            <LockOpenIcon sx={{ fontSize: 20, color: "#263A6B" }} />
          )}
          {/* users */}
          <div className="flex -space-x-2">
            {displayCollaborators.map((user, index) => (
              <Avatar
                key={`${user.name}-${index}`}
                className="h-5 w-5 rounded-full bg-[#F6F6F6] border-2 border-[#E5E5E5]"
              >
                <AvatarImage
                  src={getProfileImageUrl(user.image)}
                  alt={user.name}
                />
              </Avatar>
            ))}
          </div>
        </div>
      </div>

      {/* 마인드맵 사진 */}
      <div className="relative h-[210px] bg-gray-50 rounded-t-2xl overflow-hidden">
        <img
          src={project.thumbnail || Mindmap}
          alt="mindmap"
          className="w-full h-full object-cover"
        ></img>
      </div>

      {/* 마인드맵 하단 제목/날짜 */}
      <div className="flex justify-between items-center px-4 py-2 border-t-2 border-gray-100">
        <span className="text-sm font-medium text-gray-800">
          {project.title}
        </span>
        <span className="text-xs text-gray-400">{project.date}</span>
      </div>
    </button>
  );
}
