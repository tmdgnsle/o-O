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
    const initialState = yMap.toJSON() as Record<string, TValue>;
    console.log('[useYMapState] Initial load - first 3 entries:', Object.entries(initialState).slice(0, 3).map(([id, value]) => ({
      id,
      // @ts-ignore
      keyword: value?.keyword,
      // @ts-ignore
      memo: value?.memo,
      // @ts-ignore
      hasKeyword: 'keyword' in (value || {})
    })));
    setState(initialState);

    // 이후에는 증분 업데이트로 성능 최적화
    const observer = (event: Y.YMapEvent<TValue>) => {
      const startTime = performance.now();

      // 변경사항이 없으면 조기 반환
      if (event.keysChanged.size === 0) {
        return;
      }

      console.log(`[useYMapState] Observer fired - ${event.keysChanged.size} keys changed, transaction origin:`, event.transaction.origin);

      // ⚠️ IMPORTANT: event.changes는 동기적으로만 접근 가능
      // setState 콜백 내부에서 접근하면 "You must not compute changes after the event-handler fired" 에러 발생
      // 따라서 변경사항을 미리 계산해야 함
      const changesToApply: Array<{ key: string; action: 'delete' | 'update'; value?: TValue }> = [];

      for (const key of event.keysChanged) {
        const action = event.changes.keys.get(key);

        if (action?.action === 'delete') {
          changesToApply.push({ key, action: 'delete' });
        } else {
          const value = yMap.get(key);
          console.log(`[useYMapState] Processing key ${key}:`, {
            // @ts-ignore
            keyword: value?.keyword,
            // @ts-ignore
            memo: value?.memo,
            // @ts-ignore
            hasKeyword: value && 'keyword' in value,
            valueUndefined: value === undefined
          });

          // 🛡️ GUARD: WebSocket에서 keyword 없는 불완전한 데이터가 오면 무시
          // @ts-ignore
          if (value !== undefined && (!value || !('keyword' in value))) {
            console.warn(`[useYMapState] ⚠️ Ignoring incomplete data for key ${key} - missing keyword field`);
            continue;
          }

          if (value !== undefined) {
            changesToApply.push({ key, action: 'update', value });
          }
        }
      }

      console.log(`[useYMapState] Will apply ${changesToApply.length} changes`);

      // 계산된 변경사항을 React state에 적용
      setState(prev => {
        const next = { ...prev };  // shallow copy

        for (const change of changesToApply) {
          if (change.action === 'delete') {
            delete next[change.key];
          } else {
            next[change.key] = change.value!;
          }
        }

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
