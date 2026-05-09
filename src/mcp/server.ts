import { FastMCP } from "fastmcp";
import { version } from "../../package.json";
import { ConvertRequestSchema, generateSvg } from "../spd/core";
import { SPD_EXPLANATION } from "../spd/docs";

const mcp = new FastMCP({
  name: "PAD Tools",
  version: version as `${number}.${number}.${number}`,
});

mcp.addTool({
  name: "get_spd_explanation",
  description: "Get the explanation of SPD (Simple PAD Description) notation.",
  execute: async () => {
    return SPD_EXPLANATION;
  },
});

mcp.addTool({
  name: "convert_spd_to_svg",
  description:
    "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
  parameters: ConvertRequestSchema,
  execute: async (args) => {
    try {
      const svg = generateSvg(args.spd, args.options);
      return svg;
    } catch (error) {
      throw new Error(
        `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

mcp.start();
