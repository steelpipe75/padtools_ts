import { FastMCP } from "fastmcp";
import { version } from "../../package.json";
import { ConvertRequestSchema, generateSvg } from "../spd/core";
import { SPD_EXPLANATION } from "../spd/docs";
import { ParseError } from "../spd/parser";

const mcp = new FastMCP({
  name: "PAD Tools",
  version: version as `${number}.${number}.${number}`,
});

mcp.addResource({
  uri: "spd://docs/explanation",
  name: "SPD Notation Explanation",
  mimeType: "text/markdown",
  description: "Explanation of SPD (Simple PAD Description) notation.",
  load: async () => {
    return {
      text: SPD_EXPLANATION,
      mimeType: "text/markdown",
    };
  },
});

mcp.addPrompt({
  name: "explain-spd",
  description: "Explain SPD (Simple PAD Description) notation with examples.",
  load: async () => {
    return `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${SPD_EXPLANATION}`;
  },
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
  ],
  load: async (args) => {
    return `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${args.description}\n\nSPD記法のルールと例は以下の通りです:\n${SPD_EXPLANATION}`;
  },
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
      if (error instanceof ParseError) {
        throw new Error(
          `SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`,
        );
      }
      throw new Error(
        `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

mcp.start();
