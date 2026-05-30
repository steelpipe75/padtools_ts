/**
 * ASTをJSON文字列にシリアライズします。
 * SwitchNodeのMapをオブジェクトまたは配列に変換して保存できるようにします。
 */
export function serializeAST(ast, space) {
    if (ast === null)
        return "null";
    return JSON.stringify(ast, (_key, value) => {
        if (value instanceof Map) {
            return {
                __type: "Map",
                value: Array.from(value.entries()),
            };
        }
        return value;
    }, space);
}
/**
 * JSON文字列からASTをデシリアライズします。
 * シリアライズ時に変換されたMapを復元します。
 */
export function deserializeAST(json) {
    if (json === "null")
        return null;
    return JSON.parse(json, (_key, value) => {
        if (value && typeof value === "object" && value.__type === "Map") {
            return new Map(value.value);
        }
        return value;
    });
}
export const astUtils = {
    serializeAST,
    deserializeAST,
};
