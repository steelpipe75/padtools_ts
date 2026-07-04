/**
 * Polyfills for older Node.js environments (like Node 20 or earlier)
 * that don't support ES2024 features natively.
 */
if (typeof Object.groupBy !== "function") {
    Object.groupBy = function (items, keySelector) {
        const result = {};
        let index = 0;
        for (const item of items) {
            const key = keySelector(item, index++);
            if (result[key] === undefined) {
                result[key] = [];
            }
            result[key].push(item);
        }
        return result;
    };
}
if (typeof Map.groupBy !== "function") {
    Map.groupBy = function (items, keySelector) {
        const map = new Map();
        let index = 0;
        for (const item of items) {
            const key = keySelector(item, index++);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            }
            else {
                collection.push(item);
            }
        }
        return map;
    };
}
export {};
