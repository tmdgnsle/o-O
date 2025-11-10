import type { StylesheetStyle } from "cytoscape";

/**
 * Cytoscape 스타일시트 정의
 * - 노드는 투명하게 처리 (HTML overlay로 UI 렌더링)
 * - 드래그/선택/위치 기능만 Cytoscape가 담당
 */
export const cytoscapeStylesheet: StylesheetStyle[] = [
  // 기본 노드 스타일
  {
    selector: "node",
    style: {
      width: 160, // w-40 = 10rem = 160px (줄인 크기)
      height: 160,
      "background-color": "transparent",
      "background-opacity": 0,
      "border-width": 0,
      label: "",
      "overlay-opacity": 0,
      // 성능 최적화
      "ghost": "yes",
      "ghost-offset-x": 0,
      "ghost-offset-y": 0,
      "ghost-opacity": 0,
    },
  },
  // 선택된 노드 스타일
  {
    selector: "node:selected",
    style: {
      "border-width": 0,
      "overlay-opacity": 0,
    },
  },
  // 기본 엣지 스타일
  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#D1D5DB", // gray-300
      "target-arrow-color": "#D1D5DB",
      "target-arrow-shape": "none",
      "curve-style": "bezier",
      "control-point-step-size": 40,
      // 성능 최적화
      "arrow-scale": 1.2,
    },
  },
  // 선택된 엣지 스타일
  {
    selector: "edge:selected",
    style: {
      "line-color": "#4876FF",
      "target-arrow-color": "#4876FF",
      width: 4,
    },
  },
];

/**
 * Cytoscape 레이아웃 설정
 * - preset: 저장된 위치 그대로 사용
 * - fit: false로 설정하여 뷰포트 변경 없이 노드가 있는 위치 그대로 렌더링
 */
export const cytoscapeLayout = {
  name: "preset" as const,
  fit: false, // 뷰포트 변경 없음 - 사용자가 마지막으로 본 위치 유지
  padding: 30,
};

/**
 * Cytoscape 인스턴스 기본 설정
 */
export const cytoscapeConfig = {
  // 줌 설정
  minZoom: 0.1,
  maxZoom: 3,
  wheelSensitivity: 0.2,

  // 패닝 설정
  panningEnabled: true,
  userPanningEnabled: true,

  // 줌 설정
  zoomingEnabled: true,
  userZoomingEnabled: true,

  // 박스 선택 비활성화 (노드 개별 선택만)
  boxSelectionEnabled: false,

  // 자동 언선택 활성화
  autoungrabify: false,
  autounselectify: false,

  // 성능 최적화
  textureOnViewport: true,
  motionBlur: false,
  hideEdgesOnViewport: false,
  hideLabelsOnViewport: true,
  pixelRatio: "auto" as const,
};
