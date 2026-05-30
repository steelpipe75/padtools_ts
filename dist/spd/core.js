import _xmlFormat from "xml-formatter";
const xmlFormat = typeof _xmlFormat === "function"
    ? _xmlFormat
    : _xmlFormat.default;
import { z } from "zod";
import { optimize } from "svgo";
import { parse } from "./parser.js";
import { render } from "./svg-renderer.js";
export const ConvertRequestOptionsSchema = z.object({
    fontSize: z
        .number()
        .describe("SVGのフォントサイズ (px)")
        .optional()
        .meta({ example: 14 }),
    fontFamily: z
        .string()
        .describe("SVGのフォントファミリー")
        .optional()
        .meta({
        example: "monospace",
    }),
    strokeWidth: z
        .number()
        .describe("線の太さ (px)")
        .optional()
        .meta({ example: 1 }),
    strokeColor: z
        .string()
        .describe("線の色 (カラーコード等)")
        .optional()
        .meta({
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
    spd: z
        .string()
        .describe("ASTに変換するSPDテキスト")
        .meta({
        example: ":terminal Start\nProcess\n:terminal End",
    }),
});
export const ConvertAstToSvgRequestSchema = z.object({
    ast: z
        .any()
        .describe("SVGに変換するAST JSONオブジェクト"),
    options: ConvertRequestOptionsSchema.optional().describe("変換オプション"),
});
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
