import { useEffect, useState } from "react";
import type { Awareness } from "y-protocols/awareness";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import type { Transform } from "@/features/mindmap/types";
import {
  BUBBLE_STYLES,
  createBubbleTailStyle,
  createDirectionalArrowStyle,
} from "../utils/speechBubbleStyles";

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
  transform: Transform;
  containerWidth: number;
  containerHeight: number;
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
  transform,
  containerWidth,
  containerHeight,
  awareness,
}: Readonly<ChatBubblesOverlayProps>) {
  const [peers, setPeers] = useState<PeerChat[]>([]);

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

        // Filter out messages older than 6 seconds
        if (now - chat.timestamp > 6000) continue;

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
    if (age >= 7000) return 0; // Fully transparent after 7 seconds
    return 1 - (age - 6000) / 1000; // Fade from 1 to 0 over last 1 second
  };

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
        // Calculate position using D3 transform
        const x = peer.cursorX * transform.k + transform.x;
        const y = peer.cursorY * transform.k + transform.y;

        // Check if cursor is outside viewport
        const isOffScreenLeft = x < 0;
        const isOffScreenRight = x > containerWidth;
        const isOffScreenTop = y < 0;
        const isOffScreenBottom = y > containerHeight;
        const isOffScreen = isOffScreenLeft || isOffScreenRight || isOffScreenTop || isOffScreenBottom;

        // Clamp position to screen edges if off-screen
        let clampedX = x;
        let clampedY = y;
        let arrowDirection: "left" | "right" | "top" | "bottom" | null = null;

        if (isOffScreen) {
          if (isOffScreenLeft) {
            clampedX = 20;
            arrowDirection = "left";
          } else if (isOffScreenRight) {
            clampedX = containerWidth - 20;
            arrowDirection = "right";
          }

          if (isOffScreenTop) {
            clampedY = 20;
            arrowDirection = "top";
          } else if (isOffScreenBottom) {
            clampedY = containerHeight - 20;
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
              transform: isOffScreen
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
                borderRadius: BUBBLE_STYLES.borderRadius,
                padding: BUBBLE_STYLES.padding,
                boxShadow: BUBBLE_STYLES.boxShadow,
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
                  fontSize: BUBBLE_STYLES.fontSize,
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
              {!isOffScreen && <div style={createBubbleTailStyle(peer.color, "16%")} />}

              {/* Directional arrow (when off-screen) */}
              {isOffScreen && arrowDirection && (
                <div style={createDirectionalArrowStyle(arrowDirection, peer.color)} />
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
