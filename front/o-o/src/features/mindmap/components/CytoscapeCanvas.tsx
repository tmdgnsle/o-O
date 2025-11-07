import { useCallback, useRef, useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { type Core } from "cytoscape";
import cola from "cytoscape-cola";
import { cn } from "@/lib/utils";
import type { CytoscapeCanvasProps } from "../types";
import { cytoscapeStylesheet, cytoscapeLayout, cytoscapeConfig } from "../styles/mindmapStyles";
import { useEdges, useGraphSync, useDragSync } from "../hooks/cytoscape/useGraphSync";
import { useCytoscapeEvents, useCytoscapeInit } from "../hooks/cytoscape/useCytoscapeEvents";
import { useColaLayout } from "../hooks/cytoscape/useColaLayout";
import OverlayLayer from "./OverlayLayer";

// Cola 레이아웃 extension 등록 (최초 1회)
cytoscape.use(cola);

/**
 * CytoscapeCanvas
 * - Cytoscape 그래프 렌더링 (투명 노드, 드래그/줌/팬 기능)
 * - HTML overlay로 노드 UI 렌더링
 */
export default function CytoscapeCanvas({
  nodes,
  className,
  selectedNodeId,
  onNodeSelect,
  onNodeUnselect,
  onApplyTheme,
  onNodePositionChange,
  onBatchNodePositionChange,
  onCyReady,
}: CytoscapeCanvasProps) {

  const cyRef = useRef<Core | null>(null);
  const [cyReady, setCyReady] = useState(false);       // cy 준비 플래그
  const [overlayVersion, setOverlayVersion] = useState(0);   // pan/zoom 시 오버레이 위치 갱신용
  const initializingRef = useRef(false);              // 초기화 진행 중 플래그

  // 엣지 계산
  const edges = useEdges(nodes);

  // rAF 스로틀된 오버레이 리렌더 트리거
  const forceOverlayUpdate = useCallback(() => {
    setOverlayVersion(v => v + 1);
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current && !cyRef.current.destroyed()) {
        try {
          cyRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Cytoscape:", e);
        }
      }
      cyRef.current = null;
      setCyReady(false);
    };
  }, []);

  // cy가 준비된 이후에만 초기화/동기화/이벤트 등록
  useCytoscapeInit(cyRef.current, cytoscapeStylesheet, cytoscapeConfig, cyReady);
  useGraphSync(cyRef.current, nodes, edges, cyReady);
  useDragSync(cyRef.current, forceOverlayUpdate, cyReady);
  useCytoscapeEvents(cyRef.current, {
    onNodeSelect,
    onNodeUnselect,
    onNodePositionChange,
    onBackgroundClick: onNodeUnselect,
  }, cyReady);

  // Cola 레이아웃 완료 후 React state에 위치 반영 (batch 업데이트)
  const handleColaLayoutComplete = useCallback(
    (positions: Array<{ id: string; x: number; y: number }>) => {
      // Batch mutation 사용 (200개 노드 = 1번 localStorage write)
      if (onBatchNodePositionChange) {
        onBatchNodePositionChange(positions);
      } else if (onNodePositionChange) {
        // Fallback: 개별 업데이트 (성능 저하 가능)
        for (const pos of positions) {
          onNodePositionChange(pos.id, pos.x, pos.y);
        }
      }
    },
    [onBatchNodePositionChange, onNodePositionChange]
  );

  // Cola 레이아웃 (겹침 방지 전용) - 드래그 후에만 실행
  const { runLayout: runColaLayout } = useColaLayout(
    cyRef.current,
    true, // enabled
    cyReady,
    handleColaLayoutComplete,
    forceOverlayUpdate
  );

  // 드래그 완료 시 Cola 실행 (겹침 방지)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;

    const handleDragFree = () => {
      // 드래그 완료 후 Cola 레이아웃 실행 → 겹친 노드들만 살짝 밀어냄
      runColaLayout();
    };

    cy.on("dragfree", "node", handleDragFree);

    return () => {
      cy.off("dragfree", "node", handleDragFree);
    };
  }, [cyReady, runColaLayout]);

  // pan/zoom → rAF 스로틀로 오버레이 위치 갱신
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;
    let raf = 0;
    let lastUpdate = 0;
    const THROTTLE_MS = 16; // ~60fps 상한

    const ping = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - lastUpdate < THROTTLE_MS) return;
        forceOverlayUpdate();
        lastUpdate = now;
      });
    };

    // render 이벤트 제거: 60+ 업데이트/초 → <10 업데이트/초로 성능 개선
    cy.on("pan zoom", ping);
    window.addEventListener("resize", ping);
    return () => {
      cy.off("pan zoom", ping);
      window.removeEventListener("resize", ping);
      cancelAnimationFrame(raf);
    };
  }, [cyReady, forceOverlayUpdate]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <CytoscapeComponent
        elements={[]} // diff는 훅에서
        stylesheet={cytoscapeStylesheet}
        layout={cytoscapeLayout}
        cy={(instance) => {
          // 중복 초기화 방지
          if (cyRef.current || initializingRef.current) return;
          initializingRef.current = true;

          cyRef.current = instance;

          // 최초 1회: 기본 제스처 온
          instance.userPanningEnabled(true);
          instance.userZoomingEnabled(true);
          instance.panningEnabled(true);
          instance.zoomingEnabled(true);
          instance.boxSelectionEnabled(false);

          // renderer 옵션 주입(react-cytoscapejs prop로 안 먹는 것들)
          try {
            // @ts-expect-error - Cytoscape 내부 API 접근
            const r = instance.renderer();
            // 휠 줌 민감도
            r.options.wheelSensitivity = cytoscapeConfig.wheelSensitivity ?? 0.2;
            // 뷰포트 최적화
            r.options.hideEdgesOnViewport = cytoscapeConfig.hideEdgesOnViewport ?? false;
            r.options.hideLabelsOnViewport = cytoscapeConfig.hideLabelsOnViewport ?? true;
            r.options.textureOnViewport = cytoscapeConfig.textureOnViewport ?? true;
            // 성능 관련 반영 후 스타일 업데이트
            instance.style().update();
          } catch (e) {
            console.error("Error setting up Cytoscape renderer:", e);
          }

          setCyReady(true); // ✅ 이제 훅들 동작 시작
          initializingRef.current = false;

          // 부모 컴포넌트에 cy 인스턴스 전달
          if (onCyReady) {
            onCyReady(instance);
          }
        }}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0"
      />

      {/* HTML Overlay - OverlayLayer 컴포넌트로 통합 */}
      <OverlayLayer
        cy={cyReady ? cyRef.current : null}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        onNodeUnselect={onNodeUnselect}
        onApplyTheme={onApplyTheme}
        overlayVersion={overlayVersion}
      />
    </div>
  );
}
