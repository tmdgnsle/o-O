import { useEffect, useState } from "react";
import * as Y from "yjs";

/**
 * Subscribes to a Y.Map instance and mirrors its JSON representation as React state.
 *
 * **최적화:**
 * - 초기 로드 시에만 toJSON() 사용
 * - 이후 변경사항은 증분 업데이트로 처리하여 불필요한 객체 재생성 방지
 * - 무한 리렌더링 방지
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

    // 초기 로드만 toJSON() 사용
    setState(yMap.toJSON() as Record<string, TValue>);

    // 이후에는 증분 업데이트로 성능 최적화
    const observer = (event: Y.YMapEvent<TValue>) => {
      const startTime = performance.now();
      setState(prev => {
        // 변경사항이 없으면 기존 객체 반환 (리렌더링 방지)
        if (event.keysChanged.size === 0) {
          return prev;
        }

        const next = { ...prev };  // shallow copy

        event.keysChanged.forEach(key => {
          const action = event.changes.keys.get(key);

          if (action?.action === 'delete') {
            delete next[key];
          } else {
            const value = yMap.get(key);
            if (value !== undefined) {
              next[key] = value;
            }
          }
        });

        const elapsed = performance.now() - startTime;
        if (elapsed > 10) {
          console.log(`[useYMapState] 증분 업데이트 ${event.keysChanged.size}개 키: ${elapsed.toFixed(2)}ms`);
        }

        return next;
      });
    };

    yMap.observe(observer);

    return () => {
      yMap.unobserve(observer);
    };
  }, [yMap]);

  return state;
};
