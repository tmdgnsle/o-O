import { useEffect } from "react";
import type { Core } from "cytoscape";

/**
 * Keeps Cytoscape pan values within a fixed square boundary.
 */
export function usePanLimit(cy: Core | null, limit: number, enabled: boolean) {
  useEffect(() => {
    if (!cy || !enabled) return;

    const clampPan = () => {
      const pan = cy.pan();
      const clamped = {
        x: Math.min(limit, Math.max(-limit, pan.x)),
        y: Math.min(limit, Math.max(-limit, pan.y)),
      };

      if (pan.x !== clamped.x || pan.y !== clamped.y) {
        cy.pan(clamped);
      }
    };

    cy.on("pan", clampPan);
    return () => {
      cy.off("pan", clampPan);
    };
  }, [cy, enabled, limit]);
}
