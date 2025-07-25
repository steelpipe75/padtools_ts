"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPDParser = exports.UnexpectedIOException = exports.UnexpectedInnerException = exports.CaseDuplicateException = exports.UnexpectedCaseException = exports.UnexpectedElseException = exports.UnknownCommandException = exports.IllegalIndentException = exports.NotRequireArgumentException = exports.RequireArgumentException = exports.ParseError = void 0;
// カスタムエラークラス群
class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.ParseError = ParseError;
// 引数が必要な場合にスローされる例外
class RequireArgumentException extends ParseError {
    constructor() {
        super("このコマンドは引数が必要です");
    }
}
exports.RequireArgumentException = RequireArgumentException;
// 引数が不要な場合にスローされる例外
class NotRequireArgumentException extends ParseError {
    constructor() {
        super("このコマンドに引数は不要です");
    }
}
exports.NotRequireArgumentException = NotRequireArgumentException;
// 不正なインデントの場合にスローされる例外
class IllegalIndentException extends ParseError {
    constructor() {
        super("インデントの数が不正です");
    }
}
exports.IllegalIndentException = IllegalIndentException;
// 未知のコマンドの場合にスローされる例外
class UnknownCommandException extends ParseError {
    constructor() {
        super("未知のコマンドです");
    }
}
exports.UnknownCommandException = UnknownCommandException;
// 予期しない:elseコマンドの場合にスローされる例外
class UnexpectedElseException extends ParseError {
    constructor() {
        super("不適切なelseです");
    }
}
exports.UnexpectedElseException = UnexpectedElseException;
// 予期しない:caseコマンドの場合にスローされる例外
class UnexpectedCaseException extends ParseError {
    constructor() {
        super("不適切なcaseが現れました");
    }
}
exports.UnexpectedCaseException = UnexpectedCaseException;
// :caseの値が重複している場合にスローされる例外
class CaseDuplicateException extends ParseError {
    constructor() {
        super("既に同名のCaseが存在します");
    }
}
exports.CaseDuplicateException = CaseDuplicateException;
// 内部で予期しないエラーが発生した場合にスローされる例外
class UnexpectedInnerException extends ParseError {
    constructor(message) {
        super("内部エラー:" + message);
    }
}
exports.UnexpectedInnerException = UnexpectedInnerException;
// 予期しないI/Oエラーが発生した場合にスローされる例外
class UnexpectedIOException extends ParseError {
    constructor() {
        super("予期しないIOエラーが発生しました");
    }
}
exports.UnexpectedIOException = UnexpectedIOException;
/**
 * パース中のコンテキストを扱うクラス。
 */
class Context {
    constructor() {
        // 親のコンテキスト
        this.parent = null;
        // 深さ
        this.depth = 0;
        // ノードリスト
        this.nodeList = [];
        // コンテキストの追加状態
        this.optionStatus = "Default";
        // コンテキストの状態に結びつく引数
        this.optionArg = null;
    }
}
/**
 * SPD (Simple PAD Description) フォーマットのパーサー。
 */
class SPDParser {
    /**
     * 本文を処理する
     * @param context 現在のコンテキスト
     * @param body 本文
     */
    static handleBody(context, body) {
        // 状態の制御
        if (context.nodeList.length > 0) {
            let lnode = context.nodeList[context.nodeList.length - 1];
            if (context.optionArg != null && lnode.type === "switch") {
                let node = lnode;
                node.cases.set(context.optionArg, null);
                context.optionArg = null;
            }
        }
        if (body.startsWith(":")) {
            const parts = body.split(/[ \t]+/);
            // コマンド部分と引数部分を分離
            const cmd = parts[0].substring(1); // コマンド名（例: "call", "if"）
            const arg = parts.length > 1 ? body.substring(parts[0].length).trim() : null; // 引数
            switch (cmd) {
                case "call":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "call", text: arg, childNode: null });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "terminal":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "terminal", text: arg });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "comment":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "comment", text: arg });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "while":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "loop", isWhile: true, text: arg, childNode: null });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "dowhile":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "loop", isWhile: false, text: arg, childNode: null });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "if":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "if", text: arg, trueNode: null, falseNode: null });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "switch":
                    if (!arg)
                        throw new RequireArgumentException();
                    context.nodeList.push({ type: "switch", text: arg, cases: new Map() });
                    context.optionStatus = "Default";
                    context.optionArg = null;
                    break;
                case "else":
                    const lastIfNode = context.nodeList.length === 0 ? null : context.nodeList[context.nodeList.length - 1];
                    if (lastIfNode === null || lastIfNode.type !== "if") {
                        throw new UnexpectedElseException();
                    }
                    if (arg !== null) {
                        throw new NotRequireArgumentException();
                    }
                    context.optionStatus = "Else";
                    context.optionArg = null;
                    break;
                case "case":
                    const lastSwitchNode = context.nodeList.length === 0 ? null : context.nodeList[context.nodeList.length - 1];
                    if (lastSwitchNode === null || lastSwitchNode.type !== "switch") {
                        throw new UnexpectedCaseException();
                    }
                    if (!arg)
                        throw new RequireArgumentException();
                    if (lastSwitchNode.cases.has(arg)) {
                        throw new CaseDuplicateException();
                    }
                    context.optionStatus = "Default";
                    context.optionArg = arg;
                    break;
                default:
                    throw new UnknownCommandException();
            }
        }
        else {
            context.nodeList.push({ type: "process", text: body, childNode: null });
            context.optionStatus = "Default";
            context.optionArg = null;
        }
    }
    /**
     * 現在のコンテキストを確定し、親コンテキストに移動します。
     * @param context 現在のコンテキスト。
     * @returns 親コンテキスト。
     */
    static upToParent(context) {
        if (context === null)
            return null;
        // 状態の制御
        if (context.nodeList.length > 0) {
            let lnode = context.nodeList[context.nodeList.length - 1];
            if (context.optionArg != null && lnode.type === "switch") {
                let node = lnode;
                node.cases.set(context.optionArg, null);
                context.optionArg = null;
            }
        }
        if (context.parent === null)
            return null;
        // 追加するノードを新規作成。
        let newNode = null;
        if (context.nodeList.length == 0) {
            return context.parent;
        }
        else if (context.nodeList.length == 1) {
            newNode = context.nodeList[0];
        }
        else if (context.nodeList.length > 1) {
            let nodeList = { type: "nodeList", children: [] };
            for (let i = 0; i < context.nodeList.length; i++) {
                nodeList.children.push(context.nodeList[i]);
            }
            newNode = nodeList;
        }
        else {
            throw new UnexpectedInnerException("Parent node is not found");
        }
        // ノードの追加先となるノード。
        let pnode = context.parent.nodeList[context.parent.nodeList.length - 1];
        // ノードの種類に応じてノードの追加先に追加。
        switch (pnode.type) {
            case "process":
                let processNode = pnode;
                processNode.childNode = newNode;
                break;
            case "loop":
                let loopNode = pnode;
                loopNode.childNode = newNode;
                break;
            case "call":
                let callNode = pnode;
                callNode.childNode = newNode;
                break;
            case "switch":
                let snode = pnode;
                snode.cases.set(context.parent.optionArg, newNode);
                break;
            case "if":
                let ifnode = pnode;
                if (context.parent.optionStatus === "Default") {
                    ifnode.trueNode = newNode;
                }
                else if (context.parent.optionStatus === "Else") {
                    if (ifnode.falseNode !== null) {
                        throw new UnexpectedElseException();
                    }
                    else {
                        ifnode.falseNode = newNode;
                    }
                }
                else {
                    throw new UnexpectedInnerException("Illegal option status");
                }
                break;
            default:
                throw new UnexpectedInnerException("Illegal command");
        }
        // 親ノードの状態をリセットする。
        context.parent.optionStatus = "Default";
        context.parent.optionArg = null;
        // 親ノードを返す。
        return context.parent;
    }
    /**
     * SPDフォーマットの文字列をPADモデル（AST）にパースします。
     * @param src SPDフォーマットの文字列。
     * @returns パースされたASTのルートノード。
     */
    static parse(src, exr = SPDParser.DummyParseErrorReceiver) {
        // if(src == null) throw new IllegalArgumentException("src is null"); // # diff TypeScriptではnullチェックは不要
        // 先頭のコンテキスト
        const rootContext = new Context();
        // 現在のコンテキスト
        let context = rootContext;
        // 終了フラグ
        let errExit = false;
        // １行づつ読み込む
        // ソースコードを行ごとに分割
        const lines = src.split(/\r?\n/);
        let lineNo = 0; // 現在の行番号
        try {
            while (lineNo < lines.length) {
                let line = lines[lineNo];
                lineNo++;
                // コメント行は読み飛ばし
                if (SPDParser.patternComment.test(line))
                    continue;
                // 先頭のタブ数を数える。
                let tabNum = 0;
                for (let i = 0; i < line.length; ++i) {
                    if (line.charAt(i) === "\t") {
                        tabNum++;
                    }
                    else {
                        break;
                    }
                }
                try {
                    if (context === null) {
                        throw new IllegalIndentException();
                    }
                    // 子コンテキストの作成処理を行う。
                    if ((tabNum > 0 && context.nodeList.length == 0) || tabNum < 0) {
                        // 最初からタブがある場合は不正。
                        throw new IllegalIndentException();
                    }
                    if (tabNum > context.depth) {
                        // タブが増加した場合の処理
                        // 正当性をチェックする。
                        let parentNode = context.nodeList[context.nodeList.length - 1];
                        if (tabNum > context.depth + 1 || (parentNode && parentNode.type === "comment")) {
                            // 親がコメントか２階層以上離れているのは不正。
                            throw new IllegalIndentException();
                        }
                        if (parentNode.type === "switch" && context.optionArg == null) {
                            // 子を持たないタイプの場合は不正。
                            throw new IllegalIndentException();
                        }
                        // 子コンテキストを生成する。
                        let newContext = new Context();
                        newContext.parent = context;
                        newContext.depth = context.depth + 1;
                        context = newContext;
                    }
                    // タブが減少した際の処理
                    while (tabNum < context.depth) {
                        context = SPDParser.upToParent(context);
                        if (context === null) {
                            throw new IllegalIndentException();
                        }
                    }
                    // 本文は行のデータをtrimしたものとする。
                    // 行末が @ の場合は複数行扱いとする。
                    let body = line.substring(tabNum); // タブの後の本体部分を抽出
                    if (body.endsWith("@")) {
                        let multiLineContent = body.substring(0, body.length - 1);
                        while (lineNo < lines.length) {
                            let nextLine = lines[lineNo];
                            lineNo++;
                            // コメント行で止まる
                            if (SPDParser.patternComment.test(nextLine))
                                continue;
                            // 行末に @ が間読み込む
                            // 行末に @ がある間読み込む
                            let nextLineTabNum = 0;
                            for (let i = 0; i < nextLine.length; ++i) {
                                if (nextLine.charAt(i) === "\t") {
                                    nextLineTabNum++;
                                }
                                else {
                                    break;
                                }
                            }
                            let nextLineBody = nextLine.substring(nextLineTabNum);
                            if (nextLineBody.endsWith("@")) {
                                multiLineContent += "\n" + nextLineBody.substring(0, nextLineBody.length - 1);
                            }
                            else {
                                multiLineContent += "\n" + nextLineBody;
                                break;
                            }
                        }
                        body = multiLineContent;
                    }
                    body = body.replace(/@/g, "\n");
                    // 本文を処理する。
                    SPDParser.handleBody(context, body);
                }
                catch (ex) {
                    if (ex instanceof ParseError) {
                        if (exr(line, lineNo - 1, ex)) {
                            continue;
                        }
                        else {
                            throw ex;
                        }
                    }
                    else {
                        throw ex;
                    }
                }
            }
            // 先頭まで戻る
            while (!errExit && context != null) {
                context = SPDParser.upToParent(context);
            }
        }
        catch (ex) {
            if (ex instanceof ParseError) {
                throw ex; // テストと適切なエラーハンドリングのためにParseErrorを再スロー
            }
            else {
                console.error(`行 ${lineNo} で予期しないエラーが発生しました: ${ex}`);
                throw new ParseError(`予期しないエラー: ${ex}`); // その他のエラーをラップ
            }
        }
        // 途中で解析が終了した場合は、nullを返す。
        if (errExit)
            return null;
        // モデルを最終化して返す
        if (rootContext.nodeList.length === 0) {
            return null;
        }
        const topNode = { type: "nodeList", children: rootContext.nodeList };
        return topNode;
    }
}
exports.SPDParser = SPDParser;
// コメントを判定する正規表現オブジェクト
SPDParser.patternComment = /^\s*(#.*)?$/;
SPDParser.DummyParseErrorReceiver = (
// lineStr: string,
// lineNo: number,
// err: ParseError,
) => {
    return false;
};
