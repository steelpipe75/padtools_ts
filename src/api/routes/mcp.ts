import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import type { Context } from "hono";
import { z } from "zod";
import { version } from "../../../package.json";
import { ConvertRequestSchema, generateSvg } from "../../spd/core";
import { SPD_EXPLANATION } from "../../spd/docs";

const mcpServer = new McpServer({
  name: "PAD Tools",
  version: version,
});

// Resource
mcpServer.resource(
  "spd-explanation",
  "spd://docs/explanation",
  {
    mimeType: "text/markdown",
    description: "Explanation of SPD (Simple PAD Description) notation.",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: SPD_EXPLANATION,
        mimeType: "text/markdown",
      },
    ],
  }),
);

// Prompts
mcpServer.prompt(
  "explain-spd",
  "Explain SPD (Simple PAD Description) notation with examples.",
  {},
  async () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${SPD_EXPLANATION}`,
        },
      },
    ],
  }),
);

mcpServer.prompt(
  "generate-spd",
  "Generate SPD (Simple PAD Description) from a task description.",
  {
    description: z
      .string()
      .describe("Description of the logic or task to convert to SPD"),
  },
  async ({ description }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${description}\n\nSPD記法のルールと例は以下の通りです:\n${SPD_EXPLANATION}`,
        },
      },
    ],
  }),
);

// Tools
mcpServer.tool(
  "get_spd_explanation",
  "Get the explanation of SPD (Simple PAD Description) notation.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: SPD_EXPLANATION }],
    };
  },
);

mcpServer.tool(
  "convert_spd_to_svg",
  "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
  ConvertRequestSchema.shape,
  async (args) => {
    try {
      // @ts-ignore - options might be undefined but generateSvg handles it
      const svg = generateSvg(args.spd, args.options);
      return {
        content: [{ type: "text", text: svg }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
);

const transport = new StreamableHTTPTransport();

export const mcpHandler = async (c: Context) => {
  if (!mcpServer.isConnected()) {
    // @ts-ignore - transport type mismatch in some SDK versions but should work
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
};
