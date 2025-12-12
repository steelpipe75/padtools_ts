import type { Node } from "./ast";
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
 * SPDフォーマットの文字列をPADモデル（AST）にパースします。
 * @param src SPDフォーマットの文字列。
 * @returns パースされたASTのルートノード。
 */
export declare const parse: (src: string, exr?: ParseErrorReceiverFunction) => Node | null;
export {};
