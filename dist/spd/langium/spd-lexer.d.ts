import { DefaultLexer, LexerResult, TokenizeOptions } from 'langium';
export declare class SpdLexer extends DefaultLexer {
    tokenize(text: string, options?: TokenizeOptions): LexerResult;
}
