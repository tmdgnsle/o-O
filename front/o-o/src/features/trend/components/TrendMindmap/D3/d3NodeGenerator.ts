import type { Node, Link } from "../../../types/d3mindmapType";
import type { TrendKeywordItem } from "../../../types/trend";

export function createNodeData(
  parentKeyword: string,
  displayKeywords: TrendKeywordItem[],
  width: number,
  height: number,
  scaleFactor: number
): Node[] {
  return [
    {
      id: parentKeyword,
      label: parentKeyword,
      isParent: true,
      x: width / 2,
      y: height / 2,
      fx: width / 2,
      fy: height / 2,
    },
    // 더보기 버튼 (부모 노드 오른쪽에 고정, 화면 크기에 비례)
    {
      id: "__more__",
      label: "더보기",
      isMoreButton: true,
      x: width / 2 + 280 * Math.max(scaleFactor, 1),
      y: height / 2,
      fx: width / 2 + 280 * Math.max(scaleFactor, 1),
      fy: height / 2,
    },
    ...displayKeywords.map((child) => ({
      id: child.keyword,
      label: child.keyword,
      rank: child.rank,
    })),
  ];
}

export function createLinkData(
  parentKeyword: string,
  displayKeywords: TrendKeywordItem[]
): Link[] {
  return displayKeywords.map((child) => ({
    source: parentKeyword,
    target: child.keyword,
  }));
}

export function getNodeSize(d: Node): number {
  if (d.isParent) return 350;
  if (d.isMoreButton) return 120;
  if (!d.rank) return 160;
  switch (d.rank) {
    case 1:
      return 220;
    case 2:
      return 190;
    case 3:
      return 170;
    case 4:
      return 150;
    case 5:
      return 130;
    default:
      return 120;
  }
}
