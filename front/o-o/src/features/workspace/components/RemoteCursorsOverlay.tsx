import { useEffect, useState } from "react";
import type { Core } from "cytoscape";
import { usePeerCursors } from "./PeerCursorProvider";
import { CursorIcon } from "@/shared/ui/CursorIcon";

type RemoteCursorsOverlayProps = {
  cy: Core | null;
};

// Renders absolute-positioned peer cursors on top of the Cytoscape canvas
export function RemoteCursorsOverlay({
  cy,
}: Readonly <RemoteCursorsOverlayProps>) {
  const { peers } = usePeerCursors();
  const [viewport, setViewport] = useState({ pan: { x: 0, y: 0 }, zoom: 1 });

  // pan/zoom 변경 시 리렌더링
  useEffect(() => {
    if (!cy) return;

    const updateViewport = () => {
      setViewport({ pan: cy.pan(), zoom: cy.zoom() });
    };

    cy.on("pan zoom", updateViewport);
    return () => {
      cy.off("pan zoom", updateViewport);
    };
  }, [cy]);

  // console.log("🎯 [RemoteCursorsOverlay] Viewport:", viewport);

  // console.log("🎯 [RemoteCursorsOverlay] Rendering with peers:", peers);
  // console.log("🎯 [RemoteCursorsOverlay] Cytoscape instance:", cy);

  if (!cy) {
    return null;
  }

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {peers.map((peer) => {
        // peer.x/y는 캔버스 절대 좌표 (model coordinates)
        // 화면 좌표로 변환 (rendered position)
        const renderedPos = cy.pan();
        const zoom = cy.zoom();
        const x = peer.x * zoom + renderedPos.x;
        const y = peer.y * zoom + renderedPos.y;

        // console.log(`🎯 [RemoteCursorsOverlay] Peer ${peer.id} model:(${peer.x}, ${peer.y}) → rendered:(${x}, ${y})`);

        return (
          <div
            key={peer.id}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CursorIcon color={peer.color ?? "#3b82f6"} width={20} height={20} />
            {peer.name && (
              <div
                style={{
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontSize: 11,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                {peer.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
