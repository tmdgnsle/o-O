/**
 * Cytoscape Cola 레이아웃 설정
 * - 겹침 방지 전용 (드래그 후에만 실행)
 * - 사용자가 배치한 위치를 최대한 유지하면서 겹침만 해소
 */
export const colaLayoutConfig = {
  name: "cola" as const,

  // 애니메이션 설정 - 빠르고 부드럽게
  animate: true,
  animationDuration: 300, // ms (빠른 애니메이션)
  animationEasing: "ease-out",

  // 물리 시뮬레이션 - 최소한으로만 실행
  refresh: 1,
  maxSimulationTime: 1000, // 짧은 시뮬레이션 (겹침만 해소)
  ungrabifyWhileSimulating: false,

  // infinite: false - 지속적 물리 효과 없음

  // 겹침 방지 - 핵심 기능
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: false,
  nodeSpacing: () => {
    // 노드 간 최소 간격: 20px (살짝만 떨어트림)
    return 20;
  },

  // 힘(Force) 설정 - 매우 약하게 (위치 변경 최소화)
  // edgeLength를 설정하지 않아 엣지 기반 재배치를 비활성화
  // edgeLength: undefined,
  // edgeSymDiffLength: undefined,
  // edgeJaccardLength: undefined,

  // 레이아웃 동작 - 기존 위치 최대한 유지
  fit: false, // 뷰포트 변경 없음
  padding: 0,
  randomize: false, // 반드시 기존 위치 사용

  // 수렴 임계값 - 빠른 종료를 위해 높게 설정
  convergenceThreshold: 0.01,

  // 사용자 위치를 최대한 유지하기 위한 추가 설정
  handleDisconnected: false, // 연결되지 않은 노드는 이동하지 않음
  flow: undefined, // 방향성 없음
  alignment: undefined, // 정렬 없음
} as const;
