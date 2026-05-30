import { FastMCP } from "fastmcp";
import { getRequire } from "../utils/compat.js";
const cjsRequire = getRequire();
const packageJson = cjsRequire("../../package.json");
const { version } = packageJson;
import { ConvertAstToSvgRequestSchema, ConvertRequestSchema, ConvertSpdToAstRequestSchema, } from "../spd/core.js";
import { handleConvertAstToSvgTool, handleConvertSpdToAstTool, handleConvertSpdToSvgTool, handleExplainSpdPrompt, handleGenerateSpdPrompt, handleGetSpdExplanationResource, handleGetSpdExplanationTool, } from "./handlers.js";
export const mcp = new FastMCP({
    name: "PAD Tools",
    version: version,
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
    ],
    load: handleGenerateSpdPrompt,
});
mcp.addTool({
    name: "get_spd_explanation",
    description: "SPD（Simple PAD Description）表記法の説明を取得します。",
    execute: handleGetSpdExplanationTool,
});
mcp.addTool({
    name: "convert_spd_to_svg",
    description: "SPD（Simple PAD Description）テキストをSVG形式のPAD図に変換します。",
    parameters: ConvertRequestSchema,
    execute: handleConvertSpdToSvgTool,
});
mcp.addTool({
    name: "convert_spd_to_ast",
    description: "SPD（Simple PAD Description）テキストをJSON形式の抽象構文木（AST）に変換します。",
    parameters: ConvertSpdToAstRequestSchema,
    execute: handleConvertSpdToAstTool,
});
mcp.addTool({
    name: "convert_ast_to_svg",
    description: "JSON形式の抽象構文木（AST）をSVG形式のPAD図に変換します。",
    parameters: ConvertAstToSvgRequestSchema,
    execute: handleConvertAstToSvgTool,
});
