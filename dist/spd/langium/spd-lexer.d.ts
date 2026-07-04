import { DefaultLexer, type LexerResult, type TokenizeOptions } from "langium";
export declare class SpdLexer extends DefaultLexer {
    tokenize(text: string, options?: TokenizeOptions): LexerResult;
}
