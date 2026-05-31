import { FastMCP } from "fastmcp";
import { getRequire } from "../utils/compat.js";

const cjsRequire = getRequire();
const packageJson = cjsRequire("../../package.json");
const { version } = packageJson;

import { z } from "zod";
import {
  ConvertAstToSvgRequestSchema,
  ConvertAstToSvgResponseSchema,
  ConvertRequestSchema,
  ConvertSpdToAstRequestSchema,
  ConvertSpdToAstResponseSchema,
  ConvertSpdToSvgResponseSchema,
  GetSpdExplanationResponseSchema,
} from "../spd/core.js";
import {
  handleConvertAstToSvgTool,
  handleConvertSpdToAstTool,
  handleConvertSpdToSvgTool,
  handleExplainSpdPrompt,
  handleGenerateSpdPrompt,
  handleGetSpdExplanationResource,
  handleGetSpdExplanationTool,
} from "./handlers.js";

export const mcp = new FastMCP({
  name: "PAD Tools",
  version: version as `${number}.${number}.${number}`,
});

mcp.addResource({
  uri: "spd://docs/explanation",
  name: "SPD表記法の説明",
  mimeType: "text/markdown",
  description: "SPD（Simple PAD Description）表記法の説明。",
  load: handleGetSpdExplanationResource,
});

mcp.addPrompt({
  name: "explain-spd",
  description: "SPD（Simple PAD Description）表記法を例付きで説明します。",
  load: handleExplainSpdPrompt,
});

mcp.addPrompt({
  name: "generate-spd",
  description: "タスクの説明からSPD（Simple PAD Description）を生成します。",
  arguments: [
    {
      name: "description",
      description: "SPDに変換するためのロジックまたはタスクの説明",
      required: true,
    },
  ] as const,
  load: handleGenerateSpdPrompt,
});

mcp.addTool({
  name: "get_spd_explanation",
  description: "SPD（Simple PAD Description）表記法の説明を取得します。",
  parameters: z.object({}),
  outputSchema: GetSpdExplanationResponseSchema,
  annotations: {
    title: "SPD表記法の説明取得",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: handleGetSpdExplanationTool,
});

mcp.addTool({
  name: "convert_spd_to_svg",
  description:
    "SPD（Simple PAD Description）テキストをSVG形式 of PAD図に変換します。",
  parameters: ConvertRequestSchema,
  outputSchema: ConvertSpdToSvgResponseSchema,
  annotations: {
    title: "SPDからSVGへ変換",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: handleConvertSpdToSvgTool,
});

mcp.addTool({
  name: "convert_spd_to_ast",
  description:
    "SPD（Simple PAD Description）テキストをJSON形式の抽象構文木（AST）に変換します。",
  parameters: ConvertSpdToAstRequestSchema,
  outputSchema: ConvertSpdToAstResponseSchema,
  annotations: {
    title: "SPDからASTへ変換",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: handleConvertSpdToAstTool,
});

mcp.addTool({
  name: "convert_ast_to_svg",
  description: "JSON形式の抽象構文木（AST）をSVG形式のPAD図に変換します。",
  parameters: ConvertAstToSvgRequestSchema,
  outputSchema: ConvertAstToSvgResponseSchema,
  annotations: {
    title: "ASTからSVGへ変換",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: handleConvertAstToSvgTool,
});
