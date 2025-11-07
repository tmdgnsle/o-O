import { useCallback, useRef, useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type { Core } from "cytoscape";
import { cn } from "@/lib/utils";
import type { CytoscapeCanvasProps } from "../types";
import { cytoscapeStylesheet, cytoscapeLayout, cytoscapeConfig } from "../styles/mindmapStyles";
import { useEdges, useGraphSync, useDragSync } from "../hooks/cytoscape/useGraphSync";
import { useCytoscapeEvents, useCytoscapeInit } from "../hooks/cytoscape/useCytoscapeEvents";
import NodeOverlay from "./overlays/NodeOverlay";

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
}: CytoscapeCanvasProps) {

  const cyRef = useRef<Core | null>(null);
  const [cyReady, setCyReady] = useState(false);       // cy 준비 플래그
  const [overlayVersion, setOverlayVersion] = useState(0);   // pan/zoom 시 오버레이 위치 갱신용
  const [zoomLevel, setZoomLevel] = useState(1);      // 현재 줌 레벨
  const initializingRef = useRef(false);              // 초기화 진행 중 플래그

  // 엣지 계산
  const edges = useEdges(nodes);

  // rAF 스로틀된 오버레이 리렌더 트리거
  const forceOverlayUpdate = useCallback(() => {
    setOverlayVersion(v => v + 1);
    // 줌 레벨도 함께 업데이트
    if (cyRef.current) {
      setZoomLevel(cyRef.current.zoom());
    }
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

  // pan/zoom → rAF 스로틀로 오버레이 위치 갱신
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cyReady) return;
    let raf = 0;
    const ping = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(forceOverlayUpdate);
    };
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
        }}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0"
      />

      {/* HTML Overlay - overlayVersion으로 위치 갱신 트리거 */}
      <div className="absolute inset-0 pointer-events-none">
        {cyReady && cyRef.current && overlayVersion >= 0 && nodes.map((node) => {
          const el = cyRef.current!.getElementById(node.id);
          if (el.empty()) return null;
          const { x, y } = el.renderedPosition();
          return (
            <NodeOverlay
              key={node.id}
              node={node}
              x={x}
              y={y}
              zoom={zoomLevel}
              isSelected={selectedNodeId === node.id}
              onSelect={() => onNodeSelect(node.id)}
              onDeselect={onNodeUnselect}
              onApplyTheme={onApplyTheme}
            />
          );
        })}
      </div>
    </div>
  );
}
