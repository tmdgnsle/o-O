import * as Y from "yjs";

export type YMapCrud<TValue> = {
  set: (key: string, value: TValue) => void;
  setMany: (entries: Array<[string, TValue]>) => void;
  update: (
    key: string,
    updater: (current: TValue | undefined) => TValue | undefined
  ) => void;
  remove: (key: string) => void;
  transact: (fn: (map: Y.Map<TValue>) => void) => void;
};

/**
 * Wraps a Y.Map with convenience helpers that automatically run inside a
 * single Yjs transaction.
 */
export const createYMapCrud = <TValue,>(
  doc: Y.Doc,
  map: Y.Map<TValue>,
  origin: string = "mindmap-crud"
): YMapCrud<TValue> => {
  const transact = (fn: () => void) => {
    doc.transact(fn, origin);
  };

  return {
    set(key, value) {
      transact(() => {
        map.set(key, value);
      });
    },
    setMany(entries) {
      if (entries.length === 0) {
        return;
      }
      transact(() => {
        entries.forEach(([key, value]) => {
          map.set(key, value);
        });
      });
    },
    update(key, updater) {
      transact(() => {
        const nextValue = updater(map.get(key));
        if (nextValue === undefined) {
          map.delete(key);
          return;
        }
        map.set(key, nextValue);
      });
    },
    remove(key) {
      transact(() => {
        map.delete(key);
      });
    },
    transact(fn) {
      transact(() => fn(map));
    },
  };
};
