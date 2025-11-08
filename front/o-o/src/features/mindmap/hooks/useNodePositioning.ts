import { useCallback } from "react";
import type { NodeData } from "../types";

/**
 * 노드 위치 계산 및 겹침 방지 hook
 */
export function useNodePositioning() {
  /**
   * 기존 노드들과 겹치지 않는 위치 찾기
   * @param nodes 기존 노드 배열
   * @param baseX 기준 X 좌표
   * @param baseY 기준 Y 좌표
   * @param minDistance 최소 거리 (기본값: 150)
   * @returns 겹치지 않는 {x, y} 좌표
   */
  const findNonOverlappingPosition = useCallback(
    (nodes: NodeData[], baseX: number, baseY: number, minDistance: number = 150): { x: number; y: number } => {
      if (nodes.length === 0) {
        return { x: baseX, y: baseY };
      }

      // 후보 위치들: 기준점 기준 8방향 + 원점
      const candidates = [
        { x: baseX, y: baseY },                           // 원래 위치
        { x: baseX + 200, y: baseY },                      // 오른쪽
        { x: baseX - 200, y: baseY },                      // 왼쪽
        { x: baseX, y: baseY + 200 },                      // 아래
        { x: baseX, y: baseY - 200 },                      // 위
        { x: baseX + 150, y: baseY + 150 },                // 오른쪽 아래
        { x: baseX - 150, y: baseY + 150 },                // 왼쪽 아래
        { x: baseX + 150, y: baseY - 150 },                // 오른쪽 위
        { x: baseX - 150, y: baseY - 150 },                // 왼쪽 위
      ];

      // 각 후보 위치에서 가장 가까운 노드까지의 거리 계산
      for (const candidate of candidates) {
        let minDistToExisting = Infinity;

        for (const node of nodes) {
          const dx = candidate.x - (node.x ?? 0);
          const dy = candidate.y - (node.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy);
          minDistToExisting = Math.min(minDistToExisting, dist);
        }

        // 충분히 떨어져 있으면 해당 위치 반환
        if (minDistToExisting >= minDistance) {
          return candidate;
        }
      }

      // 모든 후보가 겹치면, 기준점에서 나선형으로 탐색
      const angleStep = Math.PI / 4; // 45도씩
      const radiusStep = 80;

      for (let radius = minDistance; radius <= 800; radius += radiusStep) {
        for (let i = 0; i < 8; i++) {
          const angle = i * angleStep;
          const candidate = {
            x: baseX + radius * Math.cos(angle),
            y: baseY + radius * Math.sin(angle),
          };

          let minDistToExisting = Infinity;
          for (const node of nodes) {
            const dx = candidate.x - (node.x ?? 0);
            const dy = candidate.y - (node.y ?? 0);
            const dist = Math.sqrt(dx * dx + dy * dy);
            minDistToExisting = Math.min(minDistToExisting, dist);
          }

          if (minDistToExisting >= minDistance) {
            return candidate;
          }
        }
      }

      // 최악의 경우 기준점에서 오른쪽 멀리 배치
      return { x: baseX + 300, y: baseY };
    },
    []
  );

  return {
    findNonOverlappingPosition,
  };
}
