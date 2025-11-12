import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Awareness } from "y-protocols/awareness";

type PeerCursor = {
  id: number;
  x: number;
  y: number;
  color?: string;
  name?: string;
  email?: string;
  profileImage?: string;
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

        const cursor = (state as { cursor?: PeerCursor; user?: { name?: string; email?: string; profileImage?: string } }).cursor;
        console.log(`   ↳ Cursor data:`, cursor);

        if (!cursor) {
          console.log("   ↳ No cursor, skipping");
          continue;
        }

        const userState = (state as { user?: { name?: string; email?: string; profileImage?: string } }).user;
        const peer = {
          id,
          x: cursor.x,
          y: cursor.y,
          color: cursor.color,
          name: userState?.name,
          email: userState?.email,
          profileImage: userState?.profileImage,
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
