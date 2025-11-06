import { X, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecommendNodeData, RecommendNodeOverlayProps } from "../../types";

export default function RecommendNodeOverlay({
  open,
  onClose,
  onSelectRecommendation,
}: RecommendNodeOverlayProps) {
  if (!open) return null;

  // Dummy 추천 노드 데이터
  const aiRecommendations: RecommendNodeData[] = [
    { id: "ai-1", text: "AI 추천 아이디어 1", type: "ai" },
    { id: "ai-2", text: "AI 추천 아이디어 2", type: "ai" },
    { id: "ai-3", text: "AI 추천 아이디어 3", type: "ai" },
  ];

  const trendRecommendations: RecommendNodeData[] = [
    { id: "trend-1", text: "트렌드 아이디어 1", type: "trend" },
    { id: "trend-2", text: "트렌드 아이디어 2", type: "trend" },
    { id: "trend-3", text: "트렌드 아이디어 3", type: "trend" },
  ];


  // 원형 배치 설정
  const radius = 180; // 중심에서 추천 노드까지의 거리

  // AI 추천 각도 (왼쪽): 아이콘 + 노드들
  const aiAngles = [-60, -30, 10, 50];
  const aiIconAngle = aiAngles[0];
  const aiNodeAngles = aiAngles.slice(1);

  // Trend 추천 각도 (오른쪽): 아이콘 + 노드들
  const trendAngles = [-120, 210, 170, 130];
  const trendIconAngle = trendAngles[0];
  const trendNodeAngles = trendAngles.slice(1);

  // 닫기 버튼 각도 (아래쪽 중앙)
  const closeButtonAngle = 90;

  // 각도와 반지름으로 위치 계산
  const getPosition = (angle: number, r: number = radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * r,
      y: Math.sin(rad) * r,
    };
  };

  // 아이콘 버튼 렌더링
  const renderIconButton = (type: "ai" | "trend", angle: number) => {
    const { x, y } = getPosition(angle);
    const Icon = type === "ai" ? Bot : Users;
    const color = type === "ai" ? "#FF69B4" : "#4A90E2";

    return (
      <div
        key={`icon-${type}`}
        className="absolute pointer-events-auto"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          transition: "all 300ms ease",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    );
  };

  // 추천 노드 렌더링
  const renderRecommendNode = (
    node: RecommendNodeData,
    angle: number,
    index: number
  ) => {
    const { x, y } = getPosition(angle);
    const bgColor = node.type === "ai" ? "#FFE6F0" : "#BAE1FF";

    return (
      <button
        type="button"
        key={node.id}
        aria-label={`추천 선택: ${node.text}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectRecommendation(node.text);
        }}
        className="absolute pointer-events-auto hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer"
        style={{
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          transition: `all 300ms ease ${index * 60}ms`,
          opacity: open ? 1 : 0,
        }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: bgColor }}
        >
          <span className="text-sm font-paperlogy font-semibold px-4 text-center break-words">
            {node.text}
          </span>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* TODO : 배경이 맨 뒤에 오도록 작업할것 */}
      {/* 배경 */}
      {/* <div
        className="fixed inset-0 bg-neutral-100/90"
        style={{ zIndex: -20 }}
        // onClick={onClose}
      /> */}

      {/* 추천 노드 컨테이너 - 배경 위에 표시 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 600 }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* AI 아이콘 */}
          {renderIconButton("ai", aiIconAngle)}

          {/* AI 추천 노드들 */}
          {aiRecommendations.map((node, index) =>
            renderRecommendNode(node, aiNodeAngles[index], index)
          )}

          {/* Trend 아이콘 */}
          {renderIconButton("trend", trendIconAngle)}

          {/* Trend 추천 노드들 */}
          {trendRecommendations.map((node, index) =>
            renderRecommendNode(node, trendNodeAngles[index], index)
          )}

          {/* 닫기 버튼 */}
          <div
            className="absolute pointer-events-auto"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${getPosition(closeButtonAngle).x}px, ${getPosition(closeButtonAngle).y}px)`,
              transition: "all 300ms ease 400ms",
              opacity: open ? 1 : 0,
            }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="rounded-full bg-white hover:bg-gray-100 shadow-lg"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>


    </>
  );
}