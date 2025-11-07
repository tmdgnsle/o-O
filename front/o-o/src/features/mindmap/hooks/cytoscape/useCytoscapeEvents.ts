import { useEffect } from "react";
import type { Core, EventObject } from "cytoscape";

export type CytoscapeEventHandlers = {
  onNodeSelect?: (nodeId: string) => void;
  onNodeUnselect?: () => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onBackgroundClick?: () => void;
};

/**
 * Cytoscape 이벤트 핸들러 관리
 * - 노드 선택/선택 해제
 * - 배경 클릭
 * NOTE: 드래그 후 위치 변경은 Cola 레이아웃이 처리
 */
export function useCytoscapeEvents(
  cy: Core | null,
  handlers: CytoscapeEventHandlers,
  cyReady: boolean = true
) {
  const { onNodeSelect, onNodeUnselect, onBackgroundClick } = handlers;

  // 노드 선택/선택 해제 이벤트
  useEffect(() => {
    if (!cy || !cyReady || !onNodeSelect || !onNodeUnselect) return;

    const handleSelect = (event: EventObject) => {
      const nodeId = event.target.id();
      onNodeSelect(nodeId);
    };

    const handleUnselect = () => {
      onNodeUnselect();
    };

    cy.on("select", "node", handleSelect);
    cy.on("unselect", "node", handleUnselect);

    return () => {
      cy.off("select", "node", handleSelect);
      cy.off("unselect", "node", handleUnselect);
    };
  }, [cy, cyReady, onNodeSelect, onNodeUnselect]);

  // NOTE: 드래그 완료 후 위치 업데이트는 Cola 레이아웃 완료 후 onLayoutComplete 콜백에서 일괄 처리
  // (dragfree → 즉시 위치 업데이트 시 Cola와 race condition 발생)

  // 배경 클릭 이벤트 (노드 선택 해제)
  useEffect(() => {
    if (!cy || !cyReady || !onBackgroundClick) return;

    const handleBackgroundTap = (event: EventObject) => {
      // 배경을 클릭한 경우에만 (노드나 엣지가 아닌 경우)
      if (event.target === cy) {
        onBackgroundClick();
      }
    };

    cy.on("tap", handleBackgroundTap);

    return () => {
      cy.off("tap", handleBackgroundTap);
    };
  }, [cy, cyReady, onBackgroundClick]);
}


/**
 * Cytoscape 인스턴스 초기 설정
 * - 스타일 적용
 * - 설정 적용
 */
export function useCytoscapeInit(
  cy: Core | null,
  stylesheet: any,
  config: any,
  cyReady: boolean = true
) {
  useEffect(() => {
    if (!cy || !cyReady) return;

    // 스타일 적용
    cy.style(stylesheet);

    // 설정 적용
    if (config.minZoom !== undefined) cy.minZoom(config.minZoom);
    if (config.maxZoom !== undefined) cy.maxZoom(config.maxZoom);
    if (config.wheelSensitivity !== undefined) {
      cy.userZoomingEnabled(config.zoomingEnabled ?? true);
      cy.userPanningEnabled(config.panningEnabled ?? true);
    }

    // 박스 선택 비활성화
    if (config.boxSelectionEnabled !== undefined) {
      cy.boxSelectionEnabled(config.boxSelectionEnabled);
    }

    // 자동 ungrabify/unselectify 설정
    if (config.autoungrabify !== undefined) {
      cy.autoungrabify(config.autoungrabify);
    }
    if (config.autounselectify !== undefined) {
      cy.autounselectify(config.autounselectify);
    }
  }, [cy, cyReady, stylesheet, config]);
}
