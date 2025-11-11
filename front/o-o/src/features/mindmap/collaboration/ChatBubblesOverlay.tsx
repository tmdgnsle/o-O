import { useEffect, useState } from "react";
import type { Core } from "cytoscape";
import type { Awareness } from "y-protocols/awareness";
import { getContrastTextColor } from "@/shared/utils/colorUtils";

type PeerChat = {
  id: number;
  cursorX: number;
  cursorY: number;
  color: string;
  name?: string;
  chatText: string;
  timestamp: number;
  isTyping: boolean;
};

type ChatBubblesOverlayProps = {
  cy: Core | null;
  awareness?: Awareness;
};

/**
 * Chat bubbles overlay component
 *
 * **Features:**
 * - Displays speech bubbles near each user's cursor
 * - Handles viewport clipping: shows bubbles on screen edges when cursor is off-screen
 * - Implements 8-second fade-out animation
 * - Matches bubble color to user's cursor color
 */
export function ChatBubblesOverlay({
  cy,
  awareness,
}: Readonly<ChatBubblesOverlayProps>) {
  const [peers, setPeers] = useState<PeerChat[]>([]);
  const [viewport, setViewport] = useState({ pan: { x: 0, y: 0 }, zoom: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update viewport on pan/zoom
  useEffect(() => {
    if (!cy) return;

    const updateViewport = () => {
      setViewport({ pan: cy.pan(), zoom: cy.zoom() });

      // Update container size
      const container = cy.container();
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    cy.on("pan zoom", updateViewport);
    updateViewport(); // Initial update

    return () => {
      cy.off("pan zoom", updateViewport);
    };
  }, [cy]);

  // Subscribe to awareness changes and extract chat data
  useEffect(() => {
    if (!awareness) {
      setPeers([]);
      return;
    }

    const updatePeers = () => {
      const next: PeerChat[] = [];
      const selfId = awareness.clientID;
      const now = Date.now();

      for (const [id, state] of awareness.getStates()) {
        if (id === selfId) continue; // Skip self

        const stateData = state as {
          cursor?: { x: number; y: number; color: string };
          user?: { name?: string };
          chat?: { isTyping: boolean; currentText: string; timestamp: number };
        };

        const cursor = stateData.cursor;
        const chat = stateData.chat;

        // Only show chat if there's a cursor and chat data
        if (!cursor || !chat || !chat.currentText) continue;

        // Filter out messages older than 8 seconds
        if (now - chat.timestamp > 8000) continue;

        next.push({
          id,
          cursorX: cursor.x,
          cursorY: cursor.y,
          color: cursor.color,
          name: stateData.user?.name,
          chatText: chat.currentText,
          timestamp: chat.timestamp,
          isTyping: chat.isTyping,
        });
      }

      setPeers(next);
    };

    awareness.on("change", updatePeers);
    updatePeers();

    // Periodic cleanup of expired messages
    const interval = setInterval(updatePeers, 1000);

    return () => {
      awareness.off("change", updatePeers);
      clearInterval(interval);
    };
  }, [awareness]);

  // Calculate opacity based on age (fade out in last 2 seconds)
  const calculateOpacity = (timestamp: number) => {
    const age = Date.now() - timestamp;
    if (age < 6000) return 1; // Full opacity for first 6 seconds
    if (age >= 8000) return 0; // Fully transparent after 8 seconds
    return 1 - (age - 6000) / 2000; // Fade from 1 to 0 over last 2 seconds
  };

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
        zIndex: 70,
        overflow: "hidden",
      }}
    >
      {peers.map((peer) => {
        // Transform model coordinates to screen coordinates
        const renderedPos = cy.pan();
        const zoom = cy.zoom();
        let x = peer.cursorX * zoom + renderedPos.x;
        let y = peer.cursorY * zoom + renderedPos.y;

        // Check if cursor is outside viewport
        const isOffScreen = {
          left: x < 0,
          right: x > containerSize.width,
          top: y < 0,
          bottom: y > containerSize.height,
        };

        const anyOffScreen = Object.values(isOffScreen).some(Boolean);

        // Clamp position to screen edges if off-screen
        let clampedX = x;
        let clampedY = y;
        let arrowDirection: "left" | "right" | "top" | "bottom" | null = null;

        if (anyOffScreen) {
          if (isOffScreen.left) {
            clampedX = 20;
            arrowDirection = "left";
          } else if (isOffScreen.right) {
            clampedX = containerSize.width - 20;
            arrowDirection = "right";
          }

          if (isOffScreen.top) {
            clampedY = 20;
            arrowDirection = "top";
          } else if (isOffScreen.bottom) {
            clampedY = containerSize.height - 20;
            arrowDirection = "bottom";
          }
        }

        const opacity = calculateOpacity(peer.timestamp);
        const textColor = getContrastTextColor(peer.color);

        return (
          <div
            key={peer.id}
            style={{
              position: "absolute",
              left: clampedX,
              top: clampedY,
              transform: anyOffScreen
                ? "translate(-50%, -50%)"
                : "translate(-10%, calc(-100% - 14px))",
              opacity,
              transition: "opacity 0.3s ease-out",
            }}
          >
            {/* Speech bubble */}
            <div
              style={{
                position: "relative",
                background: peer.color,
                borderRadius: 12,
                padding: "8px 12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                maxWidth: 250,
                wordWrap: "break-word",
              }}
            >
              {/* User name */}
              {peer.name && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    marginBottom: 4,
                    opacity: 0.7,
                    color: textColor,
                  }}
                >
                  {peer.name}
                </div>
              )}

              {/* Message text */}
              <div
                style={{
                  fontSize: 14,
                  color: textColor,
                }}
              >
                {peer.chatText}
                {peer.isTyping && (
                  <span
                    style={{
                      animation: "blink 1s infinite",
                    }}
                  >
                    |
                  </span>
                )}
              </div>

              {/* Speech bubble tail (only when on-screen) */}
              {!anyOffScreen && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: "16%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: `6px solid ${peer.color}`,
                  }}
                />
              )}

              {/* Directional arrow (when off-screen) */}
              {anyOffScreen && arrowDirection && (
                <div
                  style={{
                    position: "absolute",
                    ...(arrowDirection === "left" && {
                      left: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderRight: `8px solid ${peer.color}`,
                    }),
                    ...(arrowDirection === "right" && {
                      right: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderLeft: `8px solid ${peer.color}`,
                    }),
                    ...(arrowDirection === "top" && {
                      top: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderBottom: `8px solid ${peer.color}`,
                    }),
                    ...(arrowDirection === "bottom" && {
                      bottom: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: `8px solid ${peer.color}`,
                    }),
                    width: 0,
                    height: 0,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* CSS Animation for typing indicator */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
