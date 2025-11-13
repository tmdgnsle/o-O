import { DashboardTabNav } from "./DashboardTabNav";
import { ProjectList } from "../components/ProjectCard/ProjectList";
// TODO: 더미데이터
import popo1 from "@/shared/assets/images/popo1.png";
import popo2 from "@/shared/assets/images/popo2.png";
import popo3 from "@/shared/assets/images/popo3.png";

interface DashboardProps {
  readonly activeTab?: string;
}

const DUMMY_PROJECT = [
  {
    id: "1",
    title: "법고창신 컨셉 기획",
    date: "2025.10.24",
    isPrivate: true,
    collaborators: [
      { id: "user1", name: "김철수", image: popo1 },
      { id: "user2", name: "이영희", image: popo2 },
      { id: "user3", name: "박민수", image: popo3 },
    ],
  },
  {
    id: "2",
    title: "AI 서비스 기획",
    date: "2025.10.23",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "3",
    title: "알고리즘 싫어 프로젝트3",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
  {
    id: "4",
    title: "알고리즘 싫어 프로젝트4",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
  {
    id: "5",
    title: "알고리즘 싫어 프로젝트5",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
  {
    id: "6",
    title: "알고리즘 싫어 프로젝트6",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
  {
    id: "7",
    title: "알고리즘 싫어 프로젝트6",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
  {
    id: "8",
    title: "알고리즘 싫어 프로젝트6",
    date: "2025.10.24",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo1 }],
  },
];

export function Dashboard({ activeTab }: DashboardProps) {
  return (
    <div className="mx-12 p-5 mt-5 bg-white/60 rounded-3xl">
      <DashboardTabNav />
      <ProjectList projects={DUMMY_PROJECT} />
    </div>
  );
}
