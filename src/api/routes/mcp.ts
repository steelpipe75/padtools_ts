import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Context } from "hono";
import { z } from "zod";
import { version } from "../../../package.json";
import {
  ConvertAstToSvgRequestSchema,
  ConvertRequestSchema,
  ConvertSpdToAstRequestSchema,
  generateSvg,
  generateSvgFromAst,
} from "../../spd/core";
import { SPD_EXPLANATION } from "../../spd/docs";
import { ParseError, parse } from "../../spd/parser";
import { deserializeAST, serializeAST } from "../../spd/ast";

const mcpServer = new McpServer({
  name: "PAD Tools",
  version: version,
});

// Resource
mcpServer.registerResource(
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
mcpServer.registerPrompt(
  "explain-spd",
  {
    description: "Explain SPD (Simple PAD Description) notation with examples.",
  },
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

mcpServer.registerPrompt(
  "generate-spd",
  {
    description:
      "Generate SPD (Simple PAD Description) from a task description.",
    argsSchema: {
      description: z
        .string()
        .describe("Description of the logic or task to convert to SPD"),
    },
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
mcpServer.registerTool(
  "get_spd_explanation",
  {
    description:
      "Get the explanation of SPD (Simple PAD Description) notation.",
  },
  async () => {
    return {
      content: [{ type: "text", text: SPD_EXPLANATION }],
    };
  },
);

mcpServer.registerTool(
  "convert_spd_to_svg",
  {
    description:
      "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
    inputSchema: ConvertRequestSchema.shape,
  },
  async (args) => {
    try {
      const svg = generateSvg(args.spd, args.options);
      return {
        content: [{ type: "text", text: svg }],
      };
    } catch (error) {
      let errorMessage = `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`;
      if (error instanceof ParseError) {
        errorMessage = `SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`;
      }
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
      };
    }
  },
);

mcpServer.registerTool(
  "convert_spd_to_ast",
  {
    description:
      "Convert SPD (Simple PAD Description) text to its Abstract Syntax Tree (AST) in JSON format.",
    inputSchema: ConvertSpdToAstRequestSchema.shape,
  },
  async (args) => {
    try {
      const ast = parse(args.spd);
      if (!ast) {
        throw new Error("Failed to parse SPD");
      }
      // serialize to handle Map and then parse back to object for JSON response
      const astJson = JSON.parse(serializeAST(ast));
      return {
        content: [{ type: "text", text: JSON.stringify(astJson) }],
      };
    } catch (error) {
      let errorMessage = `Error converting SPD to AST: ${error instanceof Error ? error.message : String(error)}`;
      if (error instanceof ParseError) {
        errorMessage = `SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`;
      }
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
      };
    }
  },
);

mcpServer.registerTool(
  "convert_ast_to_svg",
  {
    description:
      "Convert an Abstract Syntax Tree (AST) in JSON format to a PAD diagram in SVG format.",
    inputSchema: ConvertAstToSvgRequestSchema.shape,
  },
  async (args) => {
    try {
      // Convert AST object to string and then deserialize to handle Map restoration
      const astString = JSON.stringify(args.ast);
      const deserializedAst = deserializeAST(astString);

      if (!deserializedAst) {
        throw new Error("Invalid AST format");
      }

      const svgOutput = generateSvgFromAst(deserializedAst, args.options);
      return {
        content: [{ type: "text", text: svgOutput }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error converting AST to SVG: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
);

const transport = new StreamableHTTPTransport();

export const mcpHandler = async (c: Context) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
};
