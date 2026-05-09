import { FastMCP } from "fastmcp";
import { ConvertRequestSchema, generateSvg } from "../spd/core";

const mcp = new FastMCP("PAD Tools");

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
