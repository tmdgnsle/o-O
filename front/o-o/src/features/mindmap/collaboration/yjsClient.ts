import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export type YClient = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  roomId: string;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
};

/**
 * Creates a Yjs document + y-websocket provider pair that automatically
 * establishes a connection (unless disabled) and exposes helpers for lifecycle
 * control.
 */
export const createYClient = (
  wsUrl: string,
  roomId: string,
  options?: { connect?: boolean }
): YClient => {
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(wsUrl, roomId, doc, {
    connect: options?.connect ?? true,
  });

  const connect = () => provider.connect();
  const disconnect = () => provider.disconnect();
  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  return {
    doc,
    provider,
    roomId,
    connect,
    disconnect,
    destroy,
  };
};
