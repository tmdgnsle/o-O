import { createBrowserRouter, type RouteObject, RouterProvider } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import MindmapPage from "@/features/mindmap/pages/MindmapPage";
import { HomePage } from "@/features/home/pages/HomePage";

function TrendPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

function NewProjectPage() {
  return <div className="container mx-auto px-6 py-8"></div>;
}

const routeConfig = [
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.TREND,
    element: <TrendPage />,
  },
  {
    path: PATHS.NEWPROJECT,
    element: <NewProjectPage />,
  },
  {
    path: PATHS.MINDMAP,
    element: <MindmapPage />,
  },
] as RouteObject[];

// 라우터 설정
const router = createBrowserRouter(
  routeConfig
);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};


export default AppRouter;