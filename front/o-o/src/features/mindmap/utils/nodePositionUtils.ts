import type { Core } from "cytoscape";

/**
 * 노드 위치 계산 관련 유틸리티 함수 모음
 *
 * Cytoscape 캔버스의 좌표계 변환 함수들을 제공합니다.
 * - Model coordinates: 캔버스 상의 절대 좌표 (pan/zoom과 무관)
 * - Screen coordinates: 브라우저 화면 상의 픽셀 좌표 (viewport 기준)
 */

/**
 * Viewport 중심을 model coordinates로 계산
 *
 * 새 노드를 추가할 때 사용자가 보고 있는 화면 중심에 배치하기 위함
 *
 * @param cy - Cytoscape 인스턴스
 * @returns { x, y } - Model coordinates of viewport center
 */
export function getViewportCenter(cy: Core): { x: number; y: number } {
  const pan = cy.pan();
  const zoom = cy.zoom();
  const container = cy.container();

  if (!container) {
    return { x: 0, y: 0 };
  }

  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;

  // Convert screen center to model coordinates
  const x = (centerX - pan.x) / zoom;
  const y = (centerY - pan.y) / zoom;

  return { x, y };
}

/**
 * 스크린 좌표를 model coordinates로 변환
 *
 * 마우스 이벤트 등에서 얻은 화면 좌표를 캔버스 절대 좌표로 변환
 *
 * @param cy - Cytoscape 인스턴스
 * @param screenX - 화면 X 좌표 (픽셀)
 * @param screenY - 화면 Y 좌표 (픽셀)
 * @returns { x, y } - Model coordinates
 */
export function screenToModelCoords(
  cy: Core,
  screenX: number,
  screenY: number
): { x: number; y: number } {
  const pan = cy.pan();
  const zoom = cy.zoom();

  const x = (screenX - pan.x) / zoom;
  const y = (screenY - pan.y) / zoom;

  return { x, y };
}

/**
 * Model coordinates를 스크린 좌표로 변환
 *
 * 캔버스 절대 좌표를 현재 pan/zoom 상태의 화면 좌표로 변환
 *
 * @param cy - Cytoscape 인스턴스
 * @param modelX - Model X 좌표
 * @param modelY - Model Y 좌표
 * @returns { x, y } - Screen coordinates (pixels)
 */
export function modelToScreenCoords(
  cy: Core,
  modelX: number,
  modelY: number
): { x: number; y: number } {
  const pan = cy.pan();
  const zoom = cy.zoom();

  const x = modelX * zoom + pan.x;
  const y = modelY * zoom + pan.y;

  return { x, y };
}
