import { FastMCP } from "fastmcp";
import { getRequire } from "../utils/compat.js";

const cjsRequire = getRequire();
const packageJson = cjsRequire("../../package.json");
const { version } = packageJson;

import {
  ConvertAstToSvgRequestSchema,
  ConvertRequestSchema,
  ConvertSpdToAstRequestSchema,
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
  name: "SPD Notation Explanation",
  mimeType: "text/markdown",
  description: "Explanation of SPD (Simple PAD Description) notation.",
  load: handleGetSpdExplanationResource,
});

mcp.addPrompt({
  name: "explain-spd",
  description: "Explain SPD (Simple PAD Description) notation with examples.",
  load: handleExplainSpdPrompt,
});

mcp.addPrompt({
  name: "generate-spd",
  description: "Generate SPD (Simple PAD Description) from a task description.",
  arguments: [
    {
      name: "description",
      description: "Description of the logic or task to convert to SPD",
      required: true,
    },
  ] as const,
  load: handleGenerateSpdPrompt,
});

mcp.addTool({
  name: "get_spd_explanation",
  description: "Get the explanation of SPD (Simple PAD Description) notation.",
  execute: handleGetSpdExplanationTool,
});

mcp.addTool({
  name: "convert_spd_to_svg",
  description:
    "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
  parameters: ConvertRequestSchema,
  execute: handleConvertSpdToSvgTool,
});

mcp.addTool({
  name: "convert_spd_to_ast",
  description:
    "Convert SPD (Simple PAD Description) text to its Abstract Syntax Tree (AST) in JSON format.",
  parameters: ConvertSpdToAstRequestSchema,
  execute: handleConvertSpdToAstTool,
});

mcp.addTool({
  name: "convert_ast_to_svg",
  description:
    "Convert an Abstract Syntax Tree (AST) in JSON format to a PAD diagram in SVG format.",
  parameters: ConvertAstToSvgRequestSchema,
  execute: handleConvertAstToSvgTool,
});
