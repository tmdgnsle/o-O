import { useEffect, useState } from "react";
import * as Y from "yjs";

/**
 * Subscribes to a Y.Map instance and mirrors its JSON representation as React state.
 */
export const useYMapState = <TValue,>(
  yMap?: Y.Map<TValue>
): Record<string, TValue> => {
  const [state, setState] = useState<Record<string, TValue>>({});

  useEffect(() => {
    if (!yMap) {
      setState({});
      return;
    }

    const emitState = () => {
      setState(yMap.toJSON() as Record<string, TValue>);
    };

    emitState();
    const observer = () => emitState();
    yMap.observe(observer);

    return () => {
      yMap.unobserve(observer);
    };
  }, [yMap]);

  return state;
};
