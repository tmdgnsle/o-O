import { useState, useCallback, useMemo, useEffect } from "react";
import type { NodeData, MindmapMode } from "../../types";

/**
 * 분석 모드 상태 및 핸들러 관리 훅
 *
 * **주요 기능:**
 * - 분석 대상 노드 선택/해제 (토글)
 * - 선택 목록 초기화
 * - 분석 실행 (현재는 콘솔 로그, 추후 AI 분석 연동 가능)
 * - 특정 노드를 선택 목록에서 제거
 *
 * **자동 초기화:**
 * - 모드 변경 시 선택 목록 자동 클리어
 *
 * @param nodes - 전체 노드 배열
 * @param mode - 현재 마인드맵 모드
 * @returns 분석 모드 상태 및 핸들러 함수들
 */
export function useAnalyzeMode(nodes: NodeData[], mode: MindmapMode) {
  const [analyzeSelection, setAnalyzeSelection] = useState<string[]>([]);

  // Clear analyze selection when switching modes
  useEffect(() => {
    setAnalyzeSelection([]);
  }, [mode]);

  /**
   * 노드 선택/해제 토글
   */
  const handleAnalyzeNodeToggle = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  /**
   * 선택 목록 전체 초기화
   */
  const handleAnalyzeClear = useCallback(() => {
    setAnalyzeSelection([]);
  }, []);

  /**
   * 분석 실행
   * - 현재는 콘솔 로그만 출력
   * - TODO: AI 분석 API 연동
   */
  const handleAnalyzeExecute = useCallback(() => {
    if (analyzeSelection.length === 0) return;
    console.log("Analyze nodes:", analyzeSelection);
    // TODO: Integrate with AI analysis service
  }, [analyzeSelection]);

  /**
   * 특정 노드를 선택 목록에서 제거
   */
  const handleAnalyzeRemoveNode = useCallback((nodeId: string) => {
    setAnalyzeSelection((prev) => prev.filter((id) => id !== nodeId));
  }, []);

  /**
   * 선택된 노드의 전체 데이터 (패널 표시용)
   */
  const selectedAnalyzeNodes = useMemo(
    () => nodes.filter((node) => analyzeSelection.includes(node.id)),
    [nodes, analyzeSelection]
  );

  return {
    analyzeSelection,
    selectedAnalyzeNodes,
    handleAnalyzeNodeToggle,
    handleAnalyzeClear,
    handleAnalyzeExecute,
    handleAnalyzeRemoveNode,
  };
}
