import { Node } from "./ast";
export declare class ParseError extends Error {
    constructor(message: string);
}
export declare class RequireArgumentException extends ParseError {
    constructor();
}
export declare class NotRequireArgumentException extends ParseError {
    constructor();
}
export declare class IllegalIndentException extends ParseError {
    constructor();
}
export declare class UnknownCommandException extends ParseError {
    constructor();
}
export declare class UnexpectedElseException extends ParseError {
    constructor();
}
export declare class UnexpectedCaseException extends ParseError {
    constructor();
}
export declare class CaseDuplicateException extends ParseError {
    constructor();
}
export declare class UnexpectedInnerException extends ParseError {
    constructor(message: string);
}
export declare class UnexpectedIOException extends ParseError {
    constructor();
}
type ParseErrorReceiverFunction = (lineStr: string, lineNo: number, err: ParseError) => boolean;
/**
 * SPD (Simple PAD Description) フォーマットのパーサー。
 */
export declare class SPDParser {
    private static readonly patternComment;
    private static DummyParseErrorReceiver;
    /**
     * 本文を処理する
     * @param context 現在のコンテキスト
     * @param body 本文
     */
    private static handleBody;
    /**
     * 現在のコンテキストを確定し、親コンテキストに移動します。
     * @param context 現在のコンテキスト。
     * @returns 親コンテキスト。
     */
    private static upToParent;
    /**
     * SPDフォーマットの文字列をPADモデル（AST）にパースします。
     * @param src SPDフォーマットの文字列。
     * @returns パースされたASTのルートノード。
     */
    static parse(src: string, exr?: ParseErrorReceiverFunction): Node | null;
}
export {};
