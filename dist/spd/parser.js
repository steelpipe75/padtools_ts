// カスタムエラークラス群
export class ParseError extends Error {
    lineNo;
    lineStr;
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}
export class RequireArgumentException extends ParseError {
    constructor() {
        super("このコマンドは引数が必要です");
        Object.setPrototypeOf(this, RequireArgumentException.prototype);
    }
}
export class NotRequireArgumentException extends ParseError {
    constructor() {
        super("このコマンドに引数は不要です");
        Object.setPrototypeOf(this, NotRequireArgumentException.prototype);
    }
}
export class IllegalIndentException extends ParseError {
    constructor() {
        super("インデントの数が不正です");
        Object.setPrototypeOf(this, IllegalIndentException.prototype);
    }
}
export class UnknownCommandException extends ParseError {
    constructor() {
        super("未知のコマンドです");
        Object.setPrototypeOf(this, UnknownCommandException.prototype);
    }
}
export class UnexpectedElseException extends ParseError {
    constructor() {
        super("不適切なelseです");
        Object.setPrototypeOf(this, UnexpectedElseException.prototype);
    }
}
export class UnexpectedCaseException extends ParseError {
    constructor() {
        super("不適切なcaseが現れました");
        Object.setPrototypeOf(this, UnexpectedCaseException.prototype);
    }
}
export class CaseDuplicateException extends ParseError {
    constructor() {
        super("既に同名のCaseが存在します");
        Object.setPrototypeOf(this, CaseDuplicateException.prototype);
    }
}
export class UnexpectedInnerException extends ParseError {
    constructor(message) {
        super(`内部エラー:${message}`);
        Object.setPrototypeOf(this, UnexpectedInnerException.prototype);
    }
}
export class UnexpectedIOException extends ParseError {
    constructor() {
        super("予期しないIOエラーが発生しました");
        Object.setPrototypeOf(this, UnexpectedIOException.prototype);
    }
}
const DummyParseErrorReceiver = () => {
    return false;
};
import { isCallStatement, isCaseStatement, isCommandStatement, isCommentStatement, isDoWhileStatement, isElseStatement, isIfStatement, isProcessStatement, isSwitchStatement, isTerminalStatement, isWhileStatement, } from "./langium/generated/ast.js";
import { spdServices } from "./langium/spd-module.js";
function cleanText(rawText, isCommand) {
    if (!rawText)
        return "";
    if (isCommand) {
        rawText = rawText.trim();
    }
    const lines = rawText.split(/\r?\n/);
    const newLines = [];
    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        l = l.replace(/^\t+/, "");
        if (l.trim().startsWith("#"))
            continue;
        if (l.endsWith("@") && !l.endsWith("\\@")) {
            l = l.substring(0, l.length - 1);
        }
        newLines.push(l);
    }
    let text = newLines.join("\n");
    text = text.replace(/(?<!\\)@/g, "\n");
    text = text.replace(/\\@/g, "@");
    return text;
}
function processStatement(stmt, srcLines, exr, errorLines) {
    try {
        if (stmt.$cstNode && errorLines.has(stmt.$cstNode.range.start.line + 1)) {
            return null;
        }
        let arg = "";
        if ("arg" in stmt && typeof stmt.arg === "string") {
            arg = cleanText(stmt.arg, true);
        }
        if (isProcessStatement(stmt)) {
            const content = cleanText(stmt.content ?? "", false);
            if (content.trim() === "") {
                return null;
            }
            return {
                type: "process",
                text: content,
                childNode: processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines),
            };
        }
        else if (isCommandStatement(stmt)) {
            if (isCallStatement(stmt)) {
                if (!arg)
                    throw new RequireArgumentException();
                return {
                    type: "call",
                    text: arg,
                    childNode: processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines),
                };
            }
            else if (isTerminalStatement(stmt)) {
                if (stmt.block && stmt.block.statements.length > 0)
                    throw new IllegalIndentException();
                if (!arg)
                    throw new RequireArgumentException();
                return {
                    type: "terminal",
                    text: arg,
                };
            }
            else if (isCommentStatement(stmt)) {
                if (stmt.block && stmt.block.statements.length > 0)
                    throw new IllegalIndentException();
                if (!arg)
                    throw new RequireArgumentException();
                return { type: "comment", text: arg };
            }
            else if (isWhileStatement(stmt)) {
                if (!arg)
                    throw new RequireArgumentException();
                return {
                    type: "loop",
                    isWhile: true,
                    text: arg,
                    childNode: processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines),
                };
            }
            else if (isDoWhileStatement(stmt)) {
                if (!arg)
                    throw new RequireArgumentException();
                return {
                    type: "loop",
                    isWhile: false,
                    text: arg,
                    childNode: processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines),
                };
            }
            else if (isIfStatement(stmt)) {
                if (!arg)
                    throw new RequireArgumentException();
                return {
                    type: "if",
                    text: arg,
                    trueNode: processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines),
                    falseNode: null,
                };
            }
            else if (isSwitchStatement(stmt)) {
                if (stmt.block && stmt.block.statements.length > 0)
                    throw new IllegalIndentException();
                if (!arg)
                    throw new RequireArgumentException();
                const cases = new Map();
                // cases are handled at block level, not inside switch block
                return {
                    type: "switch",
                    text: arg,
                    cases,
                };
            }
            else if (isCaseStatement(stmt)) {
                throw new UnexpectedCaseException();
            }
            else if (isElseStatement(stmt)) {
                throw new UnexpectedElseException();
            }
        }
        throw new UnknownCommandException();
    }
    catch (ex) {
        if (ex instanceof ParseError && ex.lineNo === undefined) {
            if (stmt.$cstNode) {
                ex.lineNo = stmt.$cstNode.range.start.line + 1; // Langium range line is 0-based
                ex.lineStr = srcLines[ex.lineNo - 1] ?? "";
            }
        }
        throw ex;
    }
}
function processBlock(statements, srcLines, exr, errorLines) {
    if (!statements || statements.length === 0)
        return null;
    const nodeList = [];
    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            if (stmt.$cstNode && errorLines.has(stmt.$cstNode.range.start.line + 1)) {
                continue;
            }
            if (isElseStatement(stmt)) {
                if (nodeList.length === 0)
                    throw new UnexpectedElseException();
                const lastNode = nodeList[nodeList.length - 1];
                if (lastNode.type !== "if")
                    throw new UnexpectedElseException();
                if (lastNode.falseNode !== null)
                    throw new UnexpectedElseException();
                const _arg = "";
                if (stmt.$cstNode) {
                    const lineStr = srcLines[stmt.$cstNode.range.start.line] ?? "";
                    const idx = lineStr.indexOf(":else");
                    if (idx !== -1) {
                        const afterElse = lineStr.substring(idx + 5).trim();
                        if (afterElse.length > 0 && !afterElse.startsWith("#")) {
                            throw new NotRequireArgumentException();
                        }
                    }
                }
                lastNode.falseNode = processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines);
            }
            else if (isCaseStatement(stmt)) {
                if (nodeList.length === 0)
                    throw new UnexpectedCaseException();
                const lastNode = nodeList[nodeList.length - 1];
                if (lastNode.type !== "switch")
                    throw new UnexpectedCaseException();
                let arg = "";
                if ("arg" in stmt && typeof stmt.arg === "string") {
                    arg = cleanText(stmt.arg, true);
                }
                if (!arg)
                    throw new RequireArgumentException();
                if (lastNode.cases.has(arg))
                    throw new CaseDuplicateException();
                lastNode.cases.set(arg, processBlock(stmt.block?.statements ?? [], srcLines, exr, errorLines));
            }
            else {
                const node = processStatement(stmt, srcLines, exr, errorLines);
                if (node) {
                    nodeList.push(node);
                }
            }
        }
        catch (ex) {
            if (ex instanceof ParseError) {
                if (ex.lineNo === undefined) {
                    if (stmt.$cstNode) {
                        ex.lineNo = stmt.$cstNode.range.start.line + 1;
                        ex.lineStr = srcLines[ex.lineNo - 1] ?? "";
                    }
                    else {
                        ex.lineNo = 1;
                        ex.lineStr = srcLines[0] ?? "";
                    }
                }
                if (exr(ex.lineStr ?? "", ex.lineNo - 1, ex)) {
                    errorLines.add(ex.lineNo);
                    continue; // ignore error and continue
                }
                throw ex;
            }
            throw ex;
        }
    }
    if (nodeList.length === 0)
        return null;
    if (nodeList.length === 1)
        return nodeList[0];
    return { type: "nodeList", children: nodeList };
}
export const parse = (src, exr = DummyParseErrorReceiver) => {
    const srcLines = src.split(/\r?\n/);
    try {
        const parseResult = spdServices.parser.LangiumParser.parse(src);
        const errorLines = new Set();
        if (parseResult.lexerErrors.length > 0 ||
            parseResult.parserErrors.length > 0) {
            const errors = [...parseResult.lexerErrors, ...parseResult.parserErrors];
            for (const err of errors) {
                let lineNo = 1;
                const errObj = err;
                if (errObj.line) {
                    lineNo = errObj.line;
                }
                else if (errObj.token) {
                    lineNo = errObj.token.startLine || 1;
                }
                const lineStr = srcLines[lineNo - 1] ?? "";
                const msg = err.message || "";
                const tokenName = errObj.token?.tokenType?.name || "";
                const isIndentError = msg.includes("INDENT") ||
                    msg.includes("DEDENT") ||
                    msg.includes("IllegalIndent") ||
                    msg.includes("synthetic:indent") ||
                    msg.includes("synthetic:dedent") ||
                    msg.includes("Unexpected token: INDENT") ||
                    msg.includes("Unexpected token: DEDENT") ||
                    (msg.includes("Expecting token of type") &&
                        (msg.includes("indent") || msg.includes("dedent"))) ||
                    tokenName === "INDENT" ||
                    tokenName === "DEDENT";
                const parseErr = isIndentError
                    ? new IllegalIndentException()
                    : new UnknownCommandException();
                parseErr.lineNo = lineNo;
                parseErr.lineStr = lineStr;
                if (!exr(lineStr, lineNo - 1, parseErr)) {
                    throw parseErr;
                }
                errorLines.add(lineNo);
            }
        }
        const model = parseResult.value;
        if (model?.$type !== "Model") {
            return null;
        }
        const statements = model
            .statements;
        const blockResult = processBlock(statements, srcLines, exr, errorLines);
        if (!blockResult)
            return null;
        if (blockResult.type !== "nodeList") {
            return { type: "nodeList", children: [blockResult] };
        }
        return blockResult;
    }
    catch (ex) {
        if (ex instanceof ParseError) {
            if (ex.lineNo === undefined) {
                ex.lineNo = 1;
                ex.lineStr = srcLines[0] ?? "";
            }
            if (exr(ex.lineStr ?? "", ex.lineNo - 1, ex)) {
                return null;
            }
            throw ex;
        }
        throw ex;
    }
};
export const parser = {
    parse,
};
