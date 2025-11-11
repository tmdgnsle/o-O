import { useState } from "react";
import { X } from "lucide-react";

// 임시 데이터 타입 정의
interface KeywordNode {
  id: string;
  label: string;
  children?: KeywordNode[];
}

// 재귀적으로 트리를 렌더링하는 컴포넌트
const KeywordTreeNode = ({
  node,
  level = 0,
  isLast = false,
  ancestorLines = [],
  onDelete,
}: {
  node: KeywordNode;
  level?: number;
  isLast?: boolean;
  ancestorLines?: boolean[];
  onDelete: (nodeId: string) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div className="flex items-center" style={{ minHeight: "28px" }}>
        {/* 각 depth에서 선 그리기 */}
        {ancestorLines.map((shouldDraw, depth) => (
          <div
            key={`${node.id}-ancestor-${depth}`}
            style={{
              width: "32px",
              height: "28px",
              position: "relative",
            }}
          >
            {shouldDraw && (
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  top: 0,
                  width: "1px",
                  height: "100%",
                  backgroundColor: "black",
                }}
              />
            )}
          </div>
        ))}

        {/* 현재 노드의 branch */}
        {level > 0 && (
          <div
            style={{
              width: "32px",
              height: "28px",
              position: "relative",
            }}
          >
            {/* 수직선 - 부모가 마지막이면 절반만 */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: 0,
                width: "1px",
                height: isLast ? "14px" : "100%",
                backgroundColor: "black",
              }}
            />
            {/* 수평선 */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: "13px",
                width: "24px",
                height: "1px",
                backgroundColor: "black",
              }}
            />
          </div>
        )}

        {/* 라벨과 삭제 버튼 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">{node.label}</span>
          <button
            onClick={() => onDelete(node.id)}
            className="flex items-center justify-center w-3 h-3 rounded-full bg-[#D16D6A] hover:bg-red-500 transition-colors"
          >
            <X className="w-2 h-2 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 자식 노드 */}
      {hasChildren &&
        node.children!.map((child, idx) => {
          const lastChild = idx === node.children!.length - 1;

          const nextAncestorLines = [...ancestorLines];

          if (level > 0) {
            // ✅ 부모(depth - 1)에서 vertical line 그릴지 결정
            nextAncestorLines[level - 1] = !isLast;
          }

          return (
            <KeywordTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLast={lastChild}
              ancestorLines={nextAncestorLines}
              onDelete={onDelete}
            />
          );
        })}
    </div>
  );
};

export function ExtractedKeywordList() {
  // 서버에서 받을 데이터 구조 (임시 목업 데이터)
  const [keywords, setKeywords] = useState<KeywordNode[]>([
    {
      id: "1",
      label: "여행 코스 추천",
      children: [
        {
          id: "2",
          label: "최적 코스",
          children: [{ id: "3", label: "사용자 맞춤형 일정" }],
        },
        {
          id: "4",
          label: "최단거리 알고리즘",
          children: [
            { id: "5", label: "BFS" },
            { id: "6", label: "다익스트라" },
            { id: "7", label: "최적화" },
          ],
        },
      ],
    },
  ]);

  // 특정 노드를 삭제하는 함수 (부모 노드 삭제 시 자식도 모두 삭제)
  const deleteNode = (nodeId: string) => {
    const removeNodeById = (nodes: KeywordNode[]): KeywordNode[] => {
      return nodes.filter((node) => {
        if (node.id === nodeId) {
          // 이 노드와 모든 자식 노드 삭제
          return false;
        }
        // 자식 노드들에서도 재귀적으로 삭제 시도
        if (node.children) {
          node.children = removeNodeById(node.children);
        }
        return true;
      });
    };

    setKeywords(removeNodeById(keywords));
  };

  return (
    <div className="space-y-1">
      {keywords.length > 0 ? (
        keywords.map((keyword) => (
          <KeywordTreeNode
            key={keyword.id}
            node={keyword}
            level={0}
            ancestorLines={[]}
            onDelete={deleteNode}
          />
        ))
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          추출된 키워드가 없습니다.
        </p>
      )}
    </div>
  );
}
