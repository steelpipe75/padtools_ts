import _xmlFormat from "xml-formatter";
const xmlFormat = typeof _xmlFormat === "function"
    ? _xmlFormat
    : _xmlFormat.default;
import { optimize } from "svgo";
import { z } from "zod";
import { parse } from "./parser.js";
import { render } from "./svg-renderer.js";
export const ConvertRequestOptionsSchema = z.object({
    fontSize: z
        .number()
        .describe("SVGのフォントサイズ (px)")
        .optional()
        .meta({ example: 14 }),
    fontFamily: z.string().describe("SVGのフォントファミリー").optional().meta({
        example: "monospace",
    }),
    strokeWidth: z
        .number()
        .describe("線の太さ (px)")
        .optional()
        .meta({ example: 1 }),
    strokeColor: z.string().describe("線の色 (カラーコード等)").optional().meta({
        example: "#000000",
    }),
    backgroundColor: z
        .string()
        .describe("図全体の背景色 (カラーコード等)")
        .optional()
        .meta({
        example: "#ffffff",
    }),
    baseBackgroundColor: z
        .string()
        .describe("ベース背景色 (none またはカラーコード等)")
        .optional()
        .meta({
        example: "none",
    }),
    textColor: z
        .string()
        .describe("テキストの色 (カラーコード等)")
        .optional()
        .meta({
        example: "#000000",
    }),
    lineHeight: z
        .number()
        .describe("行高さの倍率")
        .optional()
        .meta({ example: 1.2 }),
    listRenderType: z
        .enum(["Original", "TerminalOffset"])
        .describe("リスト（選択肢）の描画タイプ (Original: 通常, TerminalOffset: 端子オフセット)")
        .optional()
        .meta({
        example: "TerminalOffset",
    }),
    prettyprint: z
        .boolean()
        .describe("出力されるSVGを整形（インデント等）するかどうか")
        .optional()
        .meta({
        example: true,
    }),
});
export const ConvertRequestSchema = z.object({
    spd: z
        .string()
        .describe("変換対象のSPDテキスト")
        .meta({
        example: `:terminal 開始
命令
:comment コメント文
:call 関数呼び出し
	中身
:if 条件式
	真の場合
:else
	偽の場合(:else以下は省略可能)
:switch 条件
:case ケース1
	ケース1の中身
:case ケース2
	ケース2の中身
:case ...
	ケース文は必要に応じていくつでも追加できます
:while 繰り返し条件（先判定）
	中身
:dowhile 繰り返し条件（後判定）
	中身
:terminal 終了`,
    }),
    options: ConvertRequestOptionsSchema.optional().describe("変換オプション"),
});
export const ConvertSpdToAstRequestSchema = z.object({
    spd: z.string().describe("ASTに変換するSPDテキスト").meta({
        example: ":terminal Start\nProcess\n:terminal End",
    }),
});
export const AstNodeSchema = z.lazy(() => z.object({
    type: z
        .enum(["process", "if", "loop", "call", "terminal", "comment", "switch", "list"])
        .describe("ノードの種類 (process: 処理, if: 条件分岐, loop: 繰り返し, call: 呼び出し, terminal: 端子, comment: コメント, switch: 多岐分岐, list: ノードリスト)"),
    text: z.string().describe("ノードに表示するテキスト"),
    childNode: AstNodeSchema.nullable().optional().describe("次に実行される子ノード (process, loop, call, terminal 用)"),
    trueNode: AstNodeSchema.nullable().optional().describe("条件が真の場合に実行されるノード (if 用)"),
    falseNode: AstNodeSchema.nullable().optional().describe("条件が偽の場合に実行されるノード (if 用)"),
    isWhile: z.boolean().optional().describe("前判定ループ（while）か後判定ループ（dowhile）か (loop 用)"),
    cases: z.array(AstNodeSchema).optional().describe("多岐分岐のケース一覧 (switch 用)"),
    nodes: z.array(AstNodeSchema).optional().describe("ノードリスト内の子ノード一覧 (list 用)"),
})).describe("抽象構文木（AST）のノード構造");
export const ConvertAstToSvgRequestSchema = z.object({
    ast: AstNodeSchema.describe("SVGに変換するAST JSONオブジェクト"),
    options: ConvertRequestOptionsSchema.optional().describe("変換オプション"),
});
// MCP Output schemas
export const GetSpdExplanationResponseSchema = z.string().describe("SPD表記法の説明テキスト（Markdown形式）");
export const ConvertSpdToSvgResponseSchema = z.string().describe("生成されたSVG形式のPAD図");
export const ConvertSpdToAstResponseSchema = AstNodeSchema.describe("変換されたJSON形式の抽象構文木（AST）");
export const ConvertAstToSvgResponseSchema = z.string().describe("生成されたSVG形式のPAD図");
export const generateSvg = (spd, options = {}) => {
    const ast = parse(spd);
    return generateSvgFromAst(ast, options);
};
export const generateSvgFromAst = (ast, options = {}) => {
    if (!ast) {
        throw new Error("AST is null or undefined");
    }
    const renderOptions = {};
    // Map options to renderOptions
    if (options.fontSize !== undefined)
        renderOptions.fontSize = options.fontSize;
    if (options.fontFamily !== undefined)
        renderOptions.fontFamily = options.fontFamily;
    if (options.strokeWidth !== undefined)
        renderOptions.strokeWidth = options.strokeWidth;
    if (options.strokeColor !== undefined)
        renderOptions.strokeColor = options.strokeColor;
    if (options.backgroundColor !== undefined)
        renderOptions.backgroundColor = options.backgroundColor;
    if (options.baseBackgroundColor !== undefined)
        renderOptions.baseBackgroundColor = options.baseBackgroundColor;
    if (options.textColor !== undefined)
        renderOptions.textColor = options.textColor;
    if (options.lineHeight !== undefined)
        renderOptions.lineHeight = options.lineHeight;
    if (options.listRenderType !== undefined)
        renderOptions.listRenderType = options.listRenderType;
    const svgOutput = render(ast, renderOptions);
    if (options.prettyprint) {
        return xmlFormat(svgOutput);
    }
    const optimizedSvg = optimize(svgOutput, {
        multipass: true,
    });
    return optimizedSvg.data;
};
export const core = {
    generateSvg,
    generateSvgFromAst,
};
