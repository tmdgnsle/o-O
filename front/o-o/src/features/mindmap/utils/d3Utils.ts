/**
 * D3 Mindmap Utility Functions
 * - 좌표 변환
 * - 베지어 곡선 경로 생성
 * - 캔버스 크기 계산
 * - Force simulation을 이용한 레이아웃
 */

import * as d3 from "d3";
import type { NodeData } from "../types";

/**
 * 캔버스 고정 크기 상수
 */
export const CANVAS_WIDTH = 5000;
export const CANVAS_HEIGHT = 5000;
export const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
export const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;

/**
 * Pan 제한 상수 (중심에서 최대 이동 거리)
 */
export const PAN_LIMIT = 2000;

/**
 * 노드 크기 상수
 */
export const NODE_RADIUS = 80; // 160px diameter

/**
 * 두 노드 사이의 직선 경로를 생성합니다
 * @param source - 시작 노드
 * @param target - 끝 노드
 * @returns SVG path d 속성 문자열
 */
export function createBezierPath(
  source: { x: number; y: number },
  target: { x: number; y: number }
): string {
  // 직선으로 변경 (M = Move to, L = Line to)
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

/**
 * 스크린 좌표를 모델 좌표로 변환합니다
 * @param screenX - 스크린 X 좌표
 * @param screenY - 스크린 Y 좌표
 * @param transform - D3 zoom transform
 * @returns 모델 좌표
 */
export function screenToModel(
  screenX: number,
  screenY: number,
  transform: { x: number; y: number; k: number }
): { x: number; y: number } {
  return {
    x: (screenX - transform.x) / transform.k,
    y: (screenY - transform.y) / transform.k,
  };
}

/**
 * 모델 좌표를 스크린 좌표로 변환합니다
 * @param modelX - 모델 X 좌표
 * @param modelY - 모델 Y 좌표
 * @param transform - D3 zoom transform
 * @returns 스크린 좌표
 */
export function modelToScreen(
  modelX: number,
  modelY: number,
  transform: { x: number; y: number; k: number }
): { x: number; y: number } {
  return {
    x: modelX * transform.k + transform.x,
    y: modelY * transform.k + transform.y,
  };
}

/**
 * 뷰포트 중심 좌표를 모델 좌표로 가져옵니다
 * @param container - SVG 컨테이너 요소
 * @param transform - D3 zoom transform
 * @returns 뷰포트 중심의 모델 좌표
 */
export function getViewportCenter(
  container: SVGSVGElement,
  transform: { x: number; y: number; k: number }
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  return screenToModel(centerX, centerY, transform);
}

/**
 * 부모 노드를 찾습니다 (parentId가 null인 노드)
 * @param nodes - 노드 배열
 * @returns 부모 노드 또는 undefined
 */
export function findParentNode(nodes: NodeData[]): NodeData | undefined {
  return nodes.find((node) => !node.parentId || node.parentId === "0");
}

/**
 * Pan 제한을 적용합니다
 * @param x - 현재 X pan 값
 * @param y - 현재 Y pan 값
 * @param limit - Pan 제한 값
 * @returns 제한이 적용된 pan 값
 */
export function clampPan(
  x: number,
  y: number,
  limit: number
): { x: number; y: number } {
  return {
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}

/**
 * 두 좌표 사이의 거리를 계산합니다
 * @param x1 - 첫 번째 점의 X 좌표
 * @param y1 - 첫 번째 점의 Y 좌표
 * @param x2 - 두 번째 점의 X 좌표
 * @param y2 - 두 번째 점의 Y 좌표
 * @returns 두 점 사이의 거리
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 섹터 정보 (각도 범위)
 */
interface SectorInfo {
  startAngle: number;
  endAngle: number;
}

/**
 * 노드 배치 결과
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}


/**
 * 두 노드가 겹치는지 확인
 */
function isOverlapping(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  minDistance: number
): boolean {
  const dist = distance(pos1.x, pos1.y, pos2.x, pos2.y);
  return dist < minDistance;
}

/**
 * 겹침을 피하기 위해 위치를 조정 (더 강력한 충돌 회피)
 */
function adjustPositionToAvoidOverlap(
  position: { x: number; y: number },
  existingPositions: Array<{ x: number; y: number }>,
  minDistance: number,
  maxAttempts: number = 50 // 32 → 50으로 증가
): { x: number; y: number } {
  let adjusted = { ...position };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let totalPushX = 0;
    let totalPushY = 0;
    let overlapCount = 0;

    // 모든 겹치는 노드의 힘을 합산 (force-directed)
    for (const existing of existingPositions) {
      const dx = adjusted.x - existing.x;
      const dy = adjusted.y - existing.y;
      const dist = Math.hypot(dx, dy);

      if (dist < minDistance) {
        overlapCount++;

        if (dist > 0) {
          // 거리가 가까울수록 더 강한 밀어내는 힘 (제곱으로 강화)
          const pushStrength = Math.pow((minDistance - dist) / dist, 1.5);
          totalPushX += dx * pushStrength;
          totalPushY += dy * pushStrength;
        } else {
          // 정확히 같은 위치면 랜덤 방향
          const randomAngle = Math.random() * 2 * Math.PI;
          totalPushX += Math.cos(randomAngle) * minDistance;
          totalPushY += Math.sin(randomAngle) * minDistance;
        }
      }
    }

    if (overlapCount === 0) break;

    // 합산된 힘 적용 (감쇠 계수를 더 높여서 강하게 밀어냄)
    const damping = 0.8; // 0.7 → 0.8로 증가
    adjusted.x += totalPushX * damping;
    adjusted.y += totalPushY * damping;
  }

  return adjusted;
}

/**
 * 방사형 레이아웃으로 노드 위치를 계산합니다
 * D3의 tree layout을 사용하여 선이 겹치지 않도록 배치합니다
 *
 * 보장 사항:
 * 1. 노드가 본인과 연결된 선 외의 다른 선 위에 있지 않음
 * 2. 선들이 서로 교차하지 않음 (평면 그래프)
 * 3. 자식은 부모 근처에, 형제는 서로 근처에 배치
 *
 * 알고리즘: Reingold-Tilford (Tidy Tree) + Radial Projection
 *
 * @param nodes - 노드 배열 (id, parentId 속성 필요)
 * @param centerX - 루트 노드의 X 좌표
 * @param centerY - 루트 노드의 Y 좌표
 * @param baseRadius - 레벨 간 거리 (기본 300)
 * @returns 노드별 좌표 배열
 */
export function calculateRadialLayout(
  nodes: Array<{ id: string; parentId: string | null | undefined }>,
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y,
  baseRadius: number = 300
): PositionedNode[] {
  if (nodes.length === 0) return [];

  // 계층 구조 생성
  interface HierarchyNode {
    id: string;
    children?: HierarchyNode[];
  }

  const nodeMap = new Map<string, HierarchyNode>();
  let rootId: string | null = null;

  // 노드 맵 생성
  for (const node of nodes) {
    nodeMap.set(node.id, { id: node.id, children: [] });
    if (!node.parentId || node.parentId === "0") {
      rootId = node.id;
    }
  }

  // 부모-자식 관계 구성
  for (const node of nodes) {
    if (node.parentId && node.parentId !== "0") {
      const parent = nodeMap.get(String(node.parentId));
      const child = nodeMap.get(node.id);
      if (parent && child) {
        if (!parent.children) parent.children = [];
        parent.children.push(child);
      }
    }
  }

  if (!rootId) return [];

  const root = nodeMap.get(rootId);
  if (!root) return [];

  // D3 hierarchy 생성
  const hierarchy = d3.hierarchy(root, (d) => d.children);

  // 트리의 최대 깊이 계산
  let maxDepth = 0;
  hierarchy.each((node) => {
    if (node.depth > maxDepth) maxDepth = node.depth;
  });

  // Tree layout 생성 (Reingold-Tilford 알고리즘)
  // nodeSize를 사용하여 각 노드가 차지하는 최소 공간 보장
  const nodeWidth = NODE_RADIUS * 4; // 노드 간 최소 수평 거리
  const nodeHeight = baseRadius; // 레벨 간 수직 거리

  const treeLayout = d3.tree<HierarchyNode>()
    .nodeSize([nodeWidth, nodeHeight])
    .separation((a, b) => {
      // 서브트리 간 간격을 충분히 확보하여 선 교차 방지
      // 같은 부모의 자식: 1배, 다른 부모: 2배
      return a.parent === b.parent ? 1 : 2;
    });

  // 레이아웃 적용
  const treeRoot = treeLayout(hierarchy);

  // 좌표 범위 계산 (정규화를 위해)
  let minX = Infinity, maxX = -Infinity;

  treeRoot.each((node) => {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
  });

  // 직교 좌표 범위를 방사형으로 매핑
  const xRange = maxX - minX;

  // 결과 변환 (직교좌표 -> 극좌표 -> 직교좌표)
  const positions: PositionedNode[] = [];

  treeRoot.each((node) => {
    // 1. Tidy Tree의 x 좌표를 각도로 변환 (0 ~ 2π)
    const normalizedX = xRange > 0 ? (node.x - minX) / xRange : 0.5;
    const angle = normalizedX * 2 * Math.PI;

    // 2. Tidy Tree의 y 좌표(depth)를 반지름으로 변환
    const radius = node.depth * baseRadius;

    // 3. 극좌표를 직교좌표로 변환 (12시 방향부터 시계방향)
    const x = centerX + radius * Math.sin(angle);
    const y = centerY - radius * Math.cos(angle);

    positions.push({
      id: node.data.id,
      x,
      y,
    });
  });

  return positions;
}

/**
 * D3 Force Simulation을 사용하여 노드 겹침을 해소합니다
 * 초기 위치를 유지하면서 노드들이 서로 밀어내도록 합니다
 *
 * @param nodes - 초기 위치가 있는 노드 배열
 * @param centerX - 중심 X 좌표 (중심으로 당기는 힘 적용)
 * @param centerY - 중심 Y 좌표 (중심으로 당기는 힘 적용)
 * @returns Promise<PositionedNode[]> - 겹침이 해소된 노드 배열
 */
export function applyForceSimulation(
  nodes: PositionedNode[],
  centerX: number = CANVAS_CENTER_X,
  centerY: number = CANVAS_CENTER_Y
): Promise<PositionedNode[]> {
  return new Promise((resolve) => {
    if (nodes.length === 0) {
      resolve([]);
      return;
    }

    // D3 force simulation 타입을 위한 노드 인터페이스
    interface SimulationNode extends d3.SimulationNodeDatum {
      id: string;
      x: number;
      y: number;
    }

    // 노드를 simulation 형식으로 변환
    const simNodes: SimulationNode[] = nodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
    }));

    // Force simulation 생성
    const simulation = d3
      .forceSimulation<SimulationNode>(simNodes)
      // 노드끼리 밀어내는 힘 (반지름 = NODE_RADIUS * 2.5로 충분한 간격 확보)
      .force(
        "collide",
        d3.forceCollide<SimulationNode>().radius(NODE_RADIUS * 2.5).strength(0.9)
      )
      // 중심으로 살짝 당기는 힘 (너무 멀리 흩어지지 않도록)
      .force("x", d3.forceX<SimulationNode>(centerX).strength(0.05))
      .force("y", d3.forceY<SimulationNode>(centerY).strength(0.05))
      // 알파 값 설정 (시뮬레이션 강도)
      .alphaDecay(0.02) // 천천히 수렴
      .velocityDecay(0.3); // 관성 감쇠

    // 일정 반복 후 강제 종료 (300 iterations)
    simulation.tick(300);
    simulation.stop();

    // 결과 반환
    const result: PositionedNode[] = simNodes.map((n) => ({
      id: n.id,
      x: n.x ?? 0,
      y: n.y ?? 0,
    }));
    resolve(result);
  });
}
