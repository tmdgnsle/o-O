import type { NodeData } from "../types";

export type TreeNode = NodeData & {
  children: TreeNode[];
  depth: number;
};

/**
 * 선택된 노드들을 계층 구조(트리)로 변환
 *
 * @param selectedNodes - 선택된 노드 배열
 * @returns 루트 노드들의 배열 (각 노드는 children을 가짐)
 */
export function buildNodeTree(selectedNodes: NodeData[]): TreeNode[] {
  if (selectedNodes.length === 0) return [];

  // 1단계: 모든 노드를 TreeNode로 변환하고 Map에 저장
  const nodeMap = new Map<string, TreeNode>();

  selectedNodes.forEach((node) => {
    nodeMap.set(String(node.id), {
      ...node,
      children: [],
      depth: 0,
    });
  });

  // 2단계: 루트 노드와 자식 노드 분류
  const roots: TreeNode[] = [];

  selectedNodes.forEach((node) => {
    const nodeIdStr = String(node.id);
    const treeNode = nodeMap.get(nodeIdStr)!;

    // 부모가 없거나, 부모가 선택되지 않은 경우 → 루트 노드
    if (!node.parentId || !nodeMap.has(String(node.parentId))) {
      roots.push(treeNode);
    } else {
      // 부모가 선택된 경우 → 자식 노드로 추가
      const parent = nodeMap.get(String(node.parentId))!;
      treeNode.depth = parent.depth + 1;
      parent.children.push(treeNode);
    }
  });

  // 3단계: 각 레벨에서 자식들을 정렬 (선택 순서 유지 또는 텍스트 기준)
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);

  return roots;
}
