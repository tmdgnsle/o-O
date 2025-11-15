import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Awareness } from "y-protocols/awareness";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";

type PeerCursor = {
  id: number;
  x: number;
  y: number;
  color?: string;
  userId?: number; // 숫자형 userId 추가 (역할 변경 API용)
  name?: string;
  email?: string;
  profileImage?: string;
  role?: WorkspaceRole; // 워크스페이스 역할 추가
};

type PeerCursorContextValue = {
  peers: PeerCursor[];
};

const PeerCursorContext = createContext<PeerCursorContextValue>({ peers: [] });

// Shared hook so canvases/overlays can read remote cursor metadata
export const usePeerCursors = () => useContext(PeerCursorContext);

type PeerCursorProviderProps = {
  awareness?: Awareness;
  children: React.ReactNode;
};

// Keeps the awareness map mirrored into React state for rendering overlays
export function PeerCursorProvider({
  awareness,
  children,
}: Readonly<PeerCursorProviderProps>) {
  const [peers, setPeers] = useState<PeerCursor[]>([]);

  useEffect(() => {
    if (!awareness) {
      setPeers([]);
      return;
    }

    const updatePeers = () => {
      const next: PeerCursor[] = [];
      const selfId = awareness.clientID;
      const rawStates: Array<[number, unknown]> = [];

      console.log("🔍 [PeerCursorProvider] updatePeers called, selfId:", selfId);
      console.log("🔍 [PeerCursorProvider] awareness.getStates() size:", awareness.getStates().size);

      for (const [id, state] of awareness.getStates()) {
        rawStates.push([id, state]);
        console.log(`🔍 [PeerCursorProvider] Processing peer ${id}:`, state);

        if (id === selfId) {
          console.log("   ↳ Skipping self");
          continue;
        }

        const cursor = (state as { cursor?: PeerCursor; user?: { userId?: number; name?: string; email?: string; profileImage?: string; role?: WorkspaceRole } }).cursor;
        console.log(`   ↳ Cursor data:`, cursor);

        if (!cursor) {
          console.log("   ↳ No cursor, skipping");
          continue;
        }

        const userState = (state as { user?: { userId?: number; name?: string; email?: string; profileImage?: string; role?: WorkspaceRole } }).user;
        const peer = {
          id,
          x: cursor.x,
          y: cursor.y,
          color: cursor.color,
          userId: userState?.userId, // userId 추가
          name: userState?.name,
          email: userState?.email,
          profileImage: userState?.profileImage,
          role: userState?.role, // role 추가
        };
        console.log(`   ↳ Adding peer:`, peer);
        next.push(peer);
      }

      console.log("🔍 [PeerCursorProvider] Final peers array:", next);
      console.debug("[PeerCursorProvider] awareness states", rawStates);
      setPeers(next);
    };

    awareness.on("change", updatePeers);
    updatePeers();

    return () => {
      awareness.off("change", updatePeers);
    };
  }, [awareness]);

  const value = useMemo(() => ({ peers }), [peers]);

  return (
    <PeerCursorContext.Provider value={value}>
      {children}
    </PeerCursorContext.Provider>
  );
}
