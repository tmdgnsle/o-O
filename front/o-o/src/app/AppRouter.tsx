import { createBrowserRouter, type RouteObject, RouterProvider } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import MindmapPage from "@/features/mindmap/pages/MindmapPage";

const routeConfig = [
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