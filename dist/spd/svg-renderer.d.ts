import { Node } from "./ast";
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
export declare function render(node: Node | null, options?: Partial<RenderOptions>): string;
export {};
