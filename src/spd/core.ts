import _xmlFormat from "xml-formatter";

const xmlFormat =
  typeof _xmlFormat === "function"
    ? (_xmlFormat as (xml: string) => string)
    : ((_xmlFormat as Record<string, unknown>).default as (
        xml: string,
      ) => string);

import { z } from "@hono/zod-openapi";
import { optimize } from "svgo";
import { parse } from "./parser.js";
import { render } from "./svg-renderer.js";

export const ConvertRequestOptionsSchema = z.object({
  fontSize: z
    .number()
    .optional()
    .openapi({ description: "SVGのフォントサイズ (px)", example: 14 }),
  fontFamily: z.string().optional().openapi({
    description: "SVGのフォントファミリー",
    example: "monospace",
  }),
  strokeWidth: z
    .number()
    .optional()
    .openapi({ description: "線の太さ (px)", example: 1 }),
  strokeColor: z.string().optional().openapi({
    description: "線の色 (カラーコード等)",
    example: "#000000",
  }),
  backgroundColor: z.string().optional().openapi({
    description: "図全体の背景色 (カラーコード等)",
    example: "#ffffff",
  }),
  baseBackgroundColor: z.string().optional().openapi({
    description: "ベース背景色 (none またはカラーコード等)",
    example: "none",
  }),
  textColor: z
    .string()
    .optional()
    .openapi({ description: "テキストの色 (カラーコード等)", example: "#000000" }),
  lineHeight: z
    .number()
    .optional()
    .openapi({ description: "行高さの倍率", example: 1.2 }),
  listRenderType: z.enum(["Original", "TerminalOffset"]).optional().openapi({
    description: "リスト（選択肢）の描画タイプ (Original: 通常, TerminalOffset: 端子オフセット)",
    example: "TerminalOffset",
  }),
  prettyprint: z.boolean().optional().openapi({
    description: "出力されるSVGを整形（インデント等）するかどうか",
    example: true,
  }),
});

export type ConvertRequestOptions = z.infer<typeof ConvertRequestOptionsSchema>;

export const ConvertRequestSchema = z.object({
  spd: z.string().openapi({
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
    description: "変換対象のSPDテキスト",
  }),
  options: ConvertRequestOptionsSchema.optional(),
});

export type ConvertRequest = z.infer<typeof ConvertRequestSchema>;

export const ConvertSpdToAstRequestSchema = z.object({
  spd: z.string().openapi({
    example: ":terminal Start\nProcess\n:terminal End",
    description: "ASTに変換するSPDテキスト",
  }),
});

export type ConvertSpdToAstRequest = z.infer<
  typeof ConvertSpdToAstRequestSchema
>;

export const ConvertAstToSvgRequestSchema = z.object({
  ast: z.any().openapi({
    description: "SVGに変換するAST JSONオブジェクト",
  }),
  options: ConvertRequestOptionsSchema.optional(),
});

export type ConvertAstToSvgRequest = z.infer<
  typeof ConvertAstToSvgRequestSchema
>;

export const generateSvg = (
  spd: string,
  options: ConvertRequestOptions = {},
) => {
  const ast = parse(spd);
  return generateSvgFromAst(ast, options);
};

export const generateSvgFromAst = (
  ast: ReturnType<typeof parse>,
  options: ConvertRequestOptions = {},
) => {
  if (!ast) {
    throw new Error("AST is null or undefined");
  }

  const renderOptions: Parameters<typeof render>[1] = {};

  // Map options to renderOptions
  if (options.fontSize !== undefined) renderOptions.fontSize = options.fontSize;
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
