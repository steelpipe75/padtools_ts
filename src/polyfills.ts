/**
 * Polyfills for older Node.js environments (like Node 20 or earlier)
 * that don't support ES2024 features natively.
 */

if (typeof Object.groupBy !== "function") {
  Object.groupBy = <K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Partial<Record<K, T[]>> => {
    const result: Partial<Record<K, T[]>> = {};
    let index = 0;
    for (const item of items) {
      const key = keySelector(item, index++);
      if (result[key] === undefined) {
        result[key] = [];
      }
      result[key]?.push(item);
    }
    return result;
  };
}

if (typeof Map.groupBy !== "function") {
  Map.groupBy = <K, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Map<K, T[]> => {
    const map = new Map<K, T[]>();
    let index = 0;
    for (const item of items) {
      const key = keySelector(item, index++);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    }
    return map;
  };
}
