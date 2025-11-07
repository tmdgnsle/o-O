import { useEffect, useCallback, useRef } from "react";
import type { Core } from "cytoscape";
import { colaLayoutConfig } from "../../styles/colaLayoutConfig";

/**
 * useColaLayout
 * - Cola 물리 레이아웃 관리 훅
 * - 드래그 후 노드 겹침 방지를 위한 재배치
 * - 레이아웃 완료 후 React state에 위치 반영
 */
export function useColaLayout(
  cy: Core | null,
  enabled: boolean,
  cyReady: boolean,
  onLayoutComplete?: (positions: Array<{ id: string; x: number; y: number }>) => void,
  onLayoutUpdate?: () => void
) {
  const layoutRef = useRef<any>(null);

  // Cola 레이아웃 실행 함수
  const runLayout = useCallback(() => {
    if (!cy || !enabled || !cyReady) return;

    try {
      // 기존 레이아웃 중단 및 리스너 정리 (메모리 누수 방지)
      if (layoutRef.current) {
        layoutRef.current.removeAllListeners();
        layoutRef.current.stop();
      }

      // Cola 레이아웃 실행
      layoutRef.current = cy.layout(colaLayoutConfig);

      // 레이아웃 완료 시 위치 정보 수집 및 오버레이 갱신
      // one() 사용으로 자동 cleanup (on()은 누적됨)
      layoutRef.current.one("layoutstop", () => {
        if (onLayoutComplete) {
          const positions = cy.nodes().map((node) => {
            const pos = node.position();
            return {
              id: node.id(),
              x: pos.x,
              y: pos.y,
            };
          });
          onLayoutComplete(positions);
        }

        // 오버레이 강제 갱신
        if (onLayoutUpdate) {
          onLayoutUpdate();
        }
      });

      layoutRef.current.run();
    } catch (error) {
      console.error("[useColaLayout] Error running cola layout:", error);
    }
  }, [cy, enabled, cyReady, onLayoutComplete, onLayoutUpdate]);

  // 클린업
  useEffect(() => {
    return () => {
      if (layoutRef.current) {
        try {
          layoutRef.current.stop();
        } catch (error) {
          console.error("[useColaLayout] Error stopping layout:", error);
        }
      }
    };
  }, []);

  return { runLayout };
}
