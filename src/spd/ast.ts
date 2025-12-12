/**
 * 解析された構造における汎用ノードを表します。
 * いくつかの特定のノードタイプのいずれかになります。
 */
export type Node =
	| ProcessNode
	| IfNode
	| LoopNode
	| CallNode
	| TerminalNode
	| CommentNode
	| SwitchNode
	| NodeListNode;

/**
 * すべてのノードタイプの基本インターフェース
 * 共通のプロパティを提供
 */
export interface NodeBase {
	text: string;
}

/**
 * 単独の子を持つノードのインターフェース
 */
export interface WithChildNode extends NodeBase {
	childNode: Node | null;
}

/**
 * 処理ノード アクションまたは操作
 */
export interface ProcessNode extends WithChildNode {
	type: "process";
}

/**
 * if-else条件ノード
 */
export interface IfNode extends NodeBase {
	type: "if";
	trueNode: Node | null;
	falseNode: Node | null;
}

/**
 * ループノード whileループ do-whileループ
 */
export interface LoopNode extends WithChildNode {
	type: "loop";
	isWhile: boolean;
}

/**
 * 関数またはサブルーチンの呼び出しを示すコールノード
 */
export interface CallNode extends WithChildNode {
	type: "call";
}

/**
 * フローの始点、終点を示すターミナルノード
 */
export interface TerminalNode extends NodeBase {
	type: "terminal";
}

/**
 * コメントノード
 */
export interface CommentNode extends NodeBase {
	type: "comment";
}

/**
 * 複数のケースを処理するスイッチノード
 */
export interface SwitchNode extends NodeBase {
	type: "switch";
	cases: Map<string, Node | null>;
}

/**
 * ノードのリスト 順次実行
 */
export interface NodeListNode {
	type: "nodeList";
	children: Node[];
}
