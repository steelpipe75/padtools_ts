import { FastMCP } from "fastmcp";
import { version } from "../../package.json";
import { ConvertRequestSchema } from "../spd/core";
import {
  handleConvertSpdToSvgTool,
  handleExplainSpdPrompt,
  handleGenerateSpdPrompt,
  handleGetSpdExplanationResource,
  handleGetSpdExplanationTool,
} from "./handlers";

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
