import { FastMCP } from "fastmcp";
import { ConvertRequestSchema, generateSvg } from "../spd/core";
import { version } from "../../package.json";

const mcp = new FastMCP({
  name: "PAD Tools",
  version: version as `${number}.${number}.${number}`,
});

mcp.addTool({
  name: "convert_spd_to_svg",
  description: "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
  parameters: ConvertRequestSchema,
  execute: async (args) => {
    try {
      const svg = generateSvg(args.spd, args.options);
      return svg;
    } catch (error) {
      throw new Error(`Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

mcp.start();
