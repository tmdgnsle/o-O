import { useParams } from "react-router-dom";

export function TrendMindmapPage() {
  const { trendId } = useParams<{ trendId: string }>();

  return (
    <div>
      {/* TODO: 마인드맵 언니꺼 가져다쓰기 */}
      <p>트렌드 마인드맵 페이지입니다.</p>
      <p>keyword ID: {trendId}</p>
    </div>
  );
}
