import { useParams } from "react-router-dom";
import { TrendMindmapHeader } from "../components/TrendMindmap/TrendMindmapHeader";
import { TrendExpandKeyword } from "../components/TrendMindmap/TrendExpandKeyword";
import { DrawerButton } from "../components/TrendMindmap/DrawerButton";

export function TrendMindmapPage() {
  const { trendId } = useParams<{ trendId: string }>();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* 플로팅 헤더 - 최상단 고정 */}
      <div className="fixed top-10 left-10 right-10 z-50">
        <TrendMindmapHeader />
      </div>

      {/* 마인드맵 배경 - 전체 화면 */}
      <div className="absolute inset-0">
        {/* TODO: 마인드맵 언니꺼 가져다쓰기 */}
        <div className="w-full h-full flex items-center justify-center flex-col">
          <div className="w-full p-10 flex justify-between">
            <p>트렌드 마인드맵 페이지입니다.</p>
            <p>keyword ID: {trendId}</p>
            <TrendExpandKeyword />
          </div>
          <DrawerButton />
        </div>
      </div>
    </div>
  );
}
