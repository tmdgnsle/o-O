import type { NodeData } from "../types";

/**
 * 트렌드 키워드 체인을 마인드맵 노드 체인으로 변환
 *
 * @param keywords - 순서대로 부모-자식 관계를 가진 키워드 배열
 *                   예: ["알고리즘", "파이썬", "개발", "개발자"]
 * @param getRandomThemeColor - 랜덤 테마 색상 생성 함수
 * @param startX - 첫 노드의 X 좌표 (기본값: 0)
 * @param startY - 첫 노드의 Y 좌표 (기본값: 0)
 * @param horizontalSpacing - 노드 간 수평 간격 (기본값: 250)
 * @returns NodeData 배열 (부모-자식 관계 포함)
 */
export function convertTrendKeywordsToNodes(
  keywords: string[],
  getRandomThemeColor: () => string,
  startX: number = 0,
  startY: number = 0,
  horizontalSpacing: number = 250
): NodeData[] {
  if (keywords.length === 0) return [];

  const nodes: NodeData[] = [];
  let parentId: string | undefined = undefined;
  let currentX = startX;
  const currentY = startY;

  keywords.forEach((keyword, index) => {
    const nodeId = `trend-import-${Date.now()}-${index}`;

    const newNode: NodeData = {
      id: nodeId,
      text: keyword,
      x: currentX,
      y: currentY,
      color: getRandomThemeColor(),
      parentId: parentId, // 이전 노드를 부모로 설정 (첫 번째는 undefined)
    };

    nodes.push(newNode);

    // 다음 반복을 위해 현재 노드를 부모로 설정
    parentId = nodeId;
    currentX += horizontalSpacing; // 오른쪽으로 이동
  });

  return nodes;
}

/**
 * 로컬스토리지에서 임시 저장된 트렌드 키워드 가져오기
 *
 * @returns 키워드 배열 또는 null (저장된 데이터가 없는 경우)
 */
export function getPendingImportKeywords(): string[] | null {
  try {
    const stored = localStorage.getItem("pendingImportKeywords");
    if (!stored) return null;

    const keywords = JSON.parse(stored);
    if (!Array.isArray(keywords)) return null;

    return keywords;
  } catch (error) {
    console.error("[getPendingImportKeywords] Failed to parse:", error);
    return null;
  }
}

/**
 * 로컬스토리지에서 임시 저장된 트렌드 키워드 제거
 */
export function clearPendingImportKeywords(): void {
  localStorage.removeItem("pendingImportKeywords");
}