import { DefaultLexer, LexerResult, TokenizeOptions } from 'langium';
import { IToken } from 'chevrotain';

export class SpdLexer extends DefaultLexer {
    override tokenize(text: string, options?: TokenizeOptions): LexerResult {
        const result = super.tokenize(text, options);
        const newTokens: IToken[] = [];
        let currentDepth = 0;

        const indentType = this.definition['INDENT'];
        const dedentType = this.definition['DEDENT'];

        const lines = text.split(/\r?\n/);
        let lastLine = 0;

        for (const token of result.tokens) {
            if (token.startLine && token.startLine > lastLine) {
                const lineIndex = token.startLine - 1;
                const lineStr = lines[lineIndex] || '';

                let tabNum = 0;
                for (let i = 0; i < lineStr.length; ++i) {
                    if (lineStr.charAt(i) === '\t') {
                        tabNum++;
                    } else {
                        break;
                    }
                }

                // Now, adjust depth
                if (tabNum > currentDepth) {
                    for (let i = 0; i < tabNum - currentDepth; i++) {
                        newTokens.push({
                            image: '',
                            startOffset: token.startOffset,
                            startLine: token.startLine,
                            startColumn: token.startColumn,
                            endOffset: token.startOffset,
                            endLine: token.startLine,
                            endColumn: token.startColumn,
                            tokenTypeIdx: indentType.tokenTypeIdx!,
                            tokenType: indentType
                        });
                    }
                    currentDepth = tabNum;
                } else if (tabNum < currentDepth) {
                    for (let i = 0; i < currentDepth - tabNum; i++) {
                        newTokens.push({
                            image: '',
                            startOffset: token.startOffset,
                            startLine: token.startLine,
                            startColumn: token.startColumn,
                            endOffset: token.startOffset,
                            endLine: token.startLine,
                            endColumn: token.startColumn,
                            tokenTypeIdx: dedentType.tokenTypeIdx!,
                            tokenType: dedentType
                        });
                    }
                    currentDepth = tabNum;
                }
            }

            newTokens.push(token);

            if (token.endLine && token.endLine > lastLine) {
                lastLine = token.endLine;
            } else if (token.startLine && token.startLine > lastLine) {
                lastLine = token.startLine;
            }
        }

        if (currentDepth > 0) {
            const lastToken = result.tokens[result.tokens.length - 1];
            for (let i = 0; i < currentDepth; i++) {
                newTokens.push({
                    image: '',
                    startOffset: lastToken ? lastToken.endOffset ?? 0 : text.length,
                    startLine: lastToken ? lastToken.endLine ?? 1 : 1,
                    startColumn: lastToken ? lastToken.endColumn ?? 1 : 1,
                    endOffset: lastToken ? lastToken.endOffset ?? 0 : text.length,
                    endLine: lastToken ? lastToken.endLine ?? 1 : 1,
                    endColumn: lastToken ? lastToken.endColumn ?? 1 : 1,
                    tokenTypeIdx: dedentType.tokenTypeIdx!,
                    tokenType: dedentType
                });
            }
        }

        result.tokens = newTokens;
        return result;
    }
}
