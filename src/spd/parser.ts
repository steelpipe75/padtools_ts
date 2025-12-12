import type {
	CallNode,
	CommentNode,
	IfNode,
	LoopNode,
	Node,
	NodeListNode,
	ProcessNode,
	SwitchNode,
	TerminalNode,
} from "./ast";

// カスタムエラークラス群
export class ParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
// 引数が必要な場合にスローされる例外
export class RequireArgumentException extends ParseError {
	constructor() {
		super("このコマンドは引数が必要です");
	}
}
// 引数が不要な場合にスローされる例外
export class NotRequireArgumentException extends ParseError {
	constructor() {
		super("このコマンドに引数は不要です");
	}
}
// 不正なインデントの場合にスローされる例外
export class IllegalIndentException extends ParseError {
	constructor() {
		super("インデントの数が不正です");
	}
}
// 未知のコマンドの場合にスローされる例外
export class UnknownCommandException extends ParseError {
	constructor() {
		super("未知のコマンドです");
	}
}
// 予期しない:elseコマンドの場合にスローされる例外
export class UnexpectedElseException extends ParseError {
	constructor() {
		super("不適切なelseです");
	}
}
// 予期しない:caseコマンドの場合にスローされる例外
export class UnexpectedCaseException extends ParseError {
	constructor() {
		super("不適切なcaseが現れました");
	}
}
// :caseの値が重複している場合にスローされる例外
export class CaseDuplicateException extends ParseError {
	constructor() {
		super("既に同名のCaseが存在します");
	}
}
// 内部で予期しないエラーが発生した場合にスローされる例外
export class UnexpectedInnerException extends ParseError {
	constructor(message: string) {
		super(`内部エラー:${message}`);
	}
}
// 予期しないI/Oエラーが発生した場合にスローされる例外
export class UnexpectedIOException extends ParseError {
	constructor() {
		super("予期しないIOエラーが発生しました");
	}
}

type ParseErrorReceiverFunction = (
	lineStr: string,
	lineNo: number,
	err: ParseError,
) => boolean;

/**
 * パース中のコンテキストを扱うクラス。
 */
class Context {
	// 親のコンテキスト
	parent: Context | null = null;
	// 深さ
	depth = 0;
	// ノードリスト
	nodeList: Node[] = [];
	// コンテキストの追加状態
	optionStatus: "Default" | "Else" = "Default";
	// コンテキストの状態に結びつく引数
	optionArg: string | null = null;
}

/**
 * SPD (Simple PAD Description) フォーマットのパーサー。
 */
// コメントを判定する正規表現オブジェクト
const patternComment = /^\s*(#.*)?$/;

const DummyParseErrorReceiver: ParseErrorReceiverFunction = (
	// lineStr: string,
	// lineNo: number,
	// err: ParseError,
): boolean => {
	return false;
};

/**
 * 本文を処理する
 * @param context 現在のコンテキスト
 * @param body 本文
 */
const handleBody = (context: Context, body: string): void => {
	// 状態の制御
	if (context.nodeList.length > 0) {
		const lnode = context.nodeList[context.nodeList.length - 1];
		if (context.optionArg != null && lnode.type === "switch") {
			const node: SwitchNode = lnode;
			node.cases.set(context.optionArg, null);
			context.optionArg = null;
		}
	}

	if (body.startsWith(":")) {
		const parts = body.split(/[ \t]+/);

		// コマンド部分と引数部分を分離
		const cmd = parts[0].substring(1); // コマンド名（例: "call", "if"）
		const arg =
			parts.length > 1 ? body.substring(parts[0].length).trim() : null; // 引数

		switch (cmd) {
			case "call":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "call",
					text: arg,
					childNode: null,
				} as CallNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "terminal":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "terminal",
					text: arg,
				} as TerminalNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "comment":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({ type: "comment", text: arg } as CommentNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "while":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "loop",
					isWhile: true,
					text: arg,
					childNode: null,
				} as LoopNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "dowhile":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "loop",
					isWhile: false,
					text: arg,
					childNode: null,
				} as LoopNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "if":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "if",
					text: arg,
					trueNode: null,
					falseNode: null,
				} as IfNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "switch":
				if (!arg) throw new RequireArgumentException();
				context.nodeList.push({
					type: "switch",
					text: arg,
					cases: new Map<string, Node | null>(),
				} as SwitchNode);
				context.optionStatus = "Default";
				context.optionArg = null;
				break;
			case "else": {
				const lastIfNode =
					context.nodeList.length === 0
						? null
						: context.nodeList[context.nodeList.length - 1];
				if (lastIfNode === null || lastIfNode.type !== "if") {
					throw new UnexpectedElseException();
				}
				if (arg !== null) {
					throw new NotRequireArgumentException();
				}
				context.optionStatus = "Else";
				context.optionArg = null;
				break;
			}
			case "case": {
				const lastSwitchNode =
					context.nodeList.length === 0
						? null
						: context.nodeList[context.nodeList.length - 1];
				if (lastSwitchNode === null || lastSwitchNode.type !== "switch") {
					throw new UnexpectedCaseException();
				}
				if (!arg) throw new RequireArgumentException();
				if (lastSwitchNode.cases.has(arg)) {
					throw new CaseDuplicateException();
				}
				context.optionStatus = "Default";
				context.optionArg = arg;
				break;
			}
			default:
				throw new UnknownCommandException();
		}
	} else {
		context.nodeList.push({
			type: "process",
			text: body,
			childNode: null,
		} as ProcessNode);
		context.optionStatus = "Default";
		context.optionArg = null;
	}
};

/**
 * 現在のコンテキストを確定し、親コンテキストに移動します。
 * @param context 現在のコンテキスト。
 * @returns 親コンテキスト。
 */
const upToParent = (context: Context | null): Context | null => {
	if (context === null) return null;

	// 状態の制御
	if (context.nodeList.length > 0) {
		const lnode = context.nodeList[context.nodeList.length - 1];
		if (context.optionArg != null && lnode.type === "switch") {
			const node: SwitchNode = lnode as SwitchNode;
			node.cases.set(context.optionArg, null);
			context.optionArg = null;
		}
	}

	if (context.parent === null) return null;

	// 追加するノードを新規作成。
	let newNode: Node | NodeListNode | null = null;
	if (context.nodeList.length === 0) {
		return context.parent;
	} else if (context.nodeList.length === 1) {
		newNode = context.nodeList[0];
	} else {
		const nodeList = { type: "nodeList", children: [] } as NodeListNode;
		for (let i = 0; i < context.nodeList.length; i++) {
			nodeList.children.push(context.nodeList[i]);
		}
		newNode = nodeList;
	}

	// ノードの追加先となるノード。
	const pnode = context.parent.nodeList[context.parent.nodeList.length - 1];

	// ノードの種類に応じてノードの追加先に追加。
	switch (pnode.type) {
		case "process": {
			const processNode = pnode as ProcessNode;
			processNode.childNode = newNode;
			break;
		}
		case "loop": {
			const loopNode = pnode as LoopNode;
			loopNode.childNode = newNode;
			break;
		}
		case "call": {
			const callNode = pnode as CallNode;
			callNode.childNode = newNode;
			break;
		}
		case "switch": {
			const snode = pnode as SwitchNode;
			if (context.parent.optionArg !== null) {
				snode.cases.set(context.parent.optionArg, newNode);
			} else {
				throw new UnexpectedInnerException(
					"optionArg is null when it shouldn't be for switch node.",
				);
			}
			break;
		}
		case "if": {
			const ifnode = pnode as IfNode;
			if (context.parent.optionStatus === "Default") {
				ifnode.trueNode = newNode;
			} else if (context.parent.optionStatus === "Else") {
				if (ifnode.falseNode !== null) {
					throw new UnexpectedElseException();
				} else {
					ifnode.falseNode = newNode;
				}
			}
			break;
		}
	}

	// 親ノードの状態をリセットする。
	context.parent.optionStatus = "Default";
	context.parent.optionArg = null;

	// 親ノードを返す。
	return context.parent;
};

/**
 * SPDフォーマットの文字列をPADモデル（AST）にパースします。
 * @param src SPDフォーマットの文字列。
 * @returns パースされたASTのルートノード。
 */
export const parse = (
	src: string,
	exr: ParseErrorReceiverFunction = DummyParseErrorReceiver,
): Node | null => {
	// if(src == null) throw new IllegalArgumentException("src is null"); // # diff TypeScriptではnullチェックは不要

	// 先頭のコンテキスト
	const rootContext = new Context();
	// 現在のコンテキスト
	let context: Context | null = rootContext;

	// １行づつ読み込む
	// ソースコードを行ごとに分割
	const lines = src.split(/\r?\n/);
	let lineNo = 0; // 現在の行番号

	try {
		while (lineNo < lines.length) {
			const line = lines[lineNo];
			lineNo++;

			// コメント行は読み飛ばし
			if (patternComment.test(line)) continue;

			// 先頭のタブ数を数える。
			let tabNum = 0;
			for (let i = 0; i < line.length; ++i) {
				if (line.charAt(i) === "\t") {
					tabNum++;
				} else {
					break;
				}
			}

			try {
				if (context === null) {
					throw new IllegalIndentException();
				}

				// 子コンテキストの作成処理を行う。
				if ((tabNum > 0 && context.nodeList.length === 0) || tabNum < 0) {
					// 最初からタブがある場合は不正。
					throw new IllegalIndentException();
				}
				if (tabNum > context.depth) {
					// タブが増加した場合の処理

					// 正当性をチェックする。
					const parentNode = context.nodeList[context.nodeList.length - 1];
					if (
						tabNum > context.depth + 1 ||
						(parentNode && parentNode.type === "comment")
					) {
						// 親がコメントか２階層以上離れているのは不正。
						throw new IllegalIndentException();
					}
					if (parentNode.type === "switch" && context.optionArg == null) {
						// 子を持たないタイプの場合は不正。
						throw new IllegalIndentException();
					}

					// 子コンテキストを生成する。
					const newContext = new Context();
					newContext.parent = context;
					newContext.depth = context.depth + 1;
					context = newContext;
				}

				// タブが減少した際の処理
				while (tabNum < context.depth) {
					context = upToParent(context);
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
						const nextLine = lines[lineNo];
						lineNo++;

						// コメント行で止まる
						if (patternComment.test(nextLine)) continue;

						// 行末に @ が間読み込む
						// 行末に @ がある間読み込む
						let nextLineTabNum = 0;
						for (let i = 0; i < nextLine.length; ++i) {
							if (nextLine.charAt(i) === "\t") {
								nextLineTabNum++;
							} else {
								break;
							}
						}
						const nextLineBody = nextLine.substring(nextLineTabNum);

						if (nextLineBody.endsWith("@")) {
							multiLineContent += `\n${nextLineBody.substring(0, nextLineBody.length - 1)}`;
						} else {
							multiLineContent += `\n${nextLineBody}`;
							break;
						}
					}
					body = multiLineContent;
				}
				body = body.replace(/@/g, "\n");

				// 本文を処理する。
				if (context !== null) {
					handleBody(context, body);
				} else {
					throw new IllegalIndentException(); // contextがnullの場合、これは不正な状態を示す
				}
			} catch (ex) {
				if (ex instanceof ParseError) {
					if (exr(line, lineNo - 1, ex)) {
					} else {
						throw ex;
					}
				} else {
					throw ex;
				}
			}
		}

		// 先頭まで戻る
		while (context != null) {
			context = upToParent(context);
		}
	} catch (ex) {
		if (ex instanceof ParseError) {
			throw ex; // テストと適切なエラーハンドリングのためにParseErrorを再スロー
		} else {
			console.error(`行 ${lineNo} で予期しないエラーが発生しました: ${ex}`);
			throw new ParseError(`予期しないエラー: ${ex}`); // その他のエラーをラップ
		}
	}

	// モデルを最終化して返す
	if (rootContext.nodeList.length === 0) {
		return null;
	}
	const topNode: NodeListNode = {
		type: "nodeList",
		children: rootContext.nodeList,
	};
	return topNode;
};
