import type { Node } from "./ast";
/**
 * 描画に関する設定をまとめたオブジェクト
 */
interface RenderOptions {
    fontSize: number;
    fontFamily: string;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    boxPadding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    branchePadding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    strokeWidth: number;
    strokeColor: string;
    backgroundColor: string | null;
    baseBackgroundColor: string | null;
    textColor: string;
    lineHeight: number;
    doubleLineWidth: number;
    switchNodeCaseWidth: number;
    connectorWidth: number;
    nodeListSpace: number;
    childNodeOffsetWidth: number;
    listRenderType: string;
}
/**
 * ASTを受け取り、完全なSVG文字列を返す
 */
/**
 * Render AST nodes into an SVG markup string.
 *
 * @param node - The AST node to render.
 * @param options - Optional render configurations.
 * @returns A string representing the SVG markup.
 *
 * @security This function constructs an SVG string from potentially untrusted input (node text and options).
 * The returned string should be treated as untrusted HTML/SVG content.
 * When inserting the result into the DOM, use safe methods like `DOMParser.parseFromString()`
 * and `appendChild()`, or use a sanitizer library. Avoid direct assignment to `innerHTML`.
 */
export declare function render(node: Node | null, options?: Partial<RenderOptions>): string;
export {};
