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
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/trend",
    element: <TrendPage />,
  },
  {
    path: "/new-project",
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