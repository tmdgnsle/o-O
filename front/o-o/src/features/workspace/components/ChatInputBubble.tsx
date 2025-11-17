import { useEffect, useRef, useState, useMemo } from "react";
import type { Core } from "cytoscape";
import { getContrastTextColor } from "@/shared/utils/colorUtils";

type ChatInputBubbleProps = {
  cy: Core | null;
  position: { x: number; y: number }; // Model coordinates
  color: string;
  onClose: () => void;
  onUpdateChat: (chatData: { isTyping: boolean; currentText: string; timestamp: number } | null) => void;
};

/**
 * Inline chat input bubble component
 *
 * **Features:**
 * - Appears at cursor position
 * - Auto-focuses on mount
 * - Broadcasts each keystroke in real-time
 * - ESC to cancel, Enter to confirm and close
 * - Speech bubble style matching cursor color
 */
export function ChatInputBubble({
  cy,
  position,
  color,
  onClose,
  onUpdateChat,
}: Readonly<ChatInputBubbleProps>) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const [viewport, setViewport] = useState({ pan: { x: 0, y: 0 }, zoom: 1 });

  // Calculate text color based on background for readability
  const textColor = getContrastTextColor(color);

  // Track viewport changes to follow cursor in real-time
  useEffect(() => {
    if (!cy) return;

    const updateViewport = () => {
      setViewport({ pan: cy.pan(), zoom: cy.zoom() });
    };

    cy.on("pan zoom", updateViewport);
    updateViewport(); // Initial update

    return () => {
      cy.off("pan zoom", updateViewport);
    };
  }, [cy]);

  // Transform model coordinates to screen coordinates
  const screenPosition = useMemo(() => {
    if (!cy) return position;
    return {
      x: position.x * viewport.zoom + viewport.pan.x,
      y: position.y * viewport.zoom + viewport.pan.y,
    };
  }, [cy, position, viewport]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Broadcast typing state in real-time (throttled with RAF)
  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (text.length > 0) {
        onUpdateChat({
          isTyping: true,
          currentText: text,
          timestamp: Date.now(),
        });
      } else {
        onUpdateChat(null);
      }
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, onUpdateChat]);

  // Auto-close: 3 seconds if empty, 7 seconds after last input if has text
  useEffect(() => {
    const timer = text.length === 0
      ? setTimeout(() => {
          // Empty text: close after 3 seconds
          onUpdateChat(null);
          onClose();
        }, 3000)
      : setTimeout(() => {
          // Has text: close after 7 seconds of last input
          onUpdateChat(null);
          onClose();
        }, 7000);

    return () => clearTimeout(timer);
  }, [text, onClose, onUpdateChat]);

  return (
    <div
      style={{
        position: "absolute",
        left: screenPosition.x,
        top: screenPosition.y,
        transform: "translate(-10%, -140%)",
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          position: "relative",
          background: color,
          borderRadius: 12,
          padding: "8px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          minWidth: 200,
          marginBottom: 8,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: textColor,
            fontSize: 14,
          }}
          maxLength={200}
        />

        {/* Speech bubble tail */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "10%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${color}`,
          }}
        />
      </div>
    </div>
  );
}
