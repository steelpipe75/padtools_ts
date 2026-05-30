import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Context } from "hono";
import { getRequire } from "../../utils/compat.js";
const cjsRequire = getRequire();
const packageJson = cjsRequire("../../../package.json");
const { version } = packageJson;
import {
  handleConvertAstToSvgTool,
  handleConvertSpdToAstTool,
  handleConvertSpdToSvgTool,
  handleExplainSpdPrompt,
  handleGenerateSpdPrompt,
  handleGetSpdExplanationResource,
  handleGetSpdExplanationTool,
} from "../../mcp/handlers.js";
import {
  ConvertAstToSvgRequestSchema,
  ConvertRequestSchema,
  ConvertSpdToAstRequestSchema,
} from "../../spd/core.js";

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
  async (uri) => {
    const result = await handleGetSpdExplanationResource();
    return {
      contents: [
        {
          uri: uri.href,
          text: result.text,
          mimeType: result.mimeType,
        },
      ],
    };
  },
);

// Prompts
mcpServer.registerPrompt(
  "explain-spd",
  {
    description: "Explain SPD (Simple PAD Description) notation with examples.",
  },
  async () => {
    const text = await handleExplainSpdPrompt();
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: text,
          },
        },
      ],
    };
  },
);

mcpServer.registerPrompt(
  "generate-spd",
  {
    description:
      "Generate SPD (Simple PAD Description) from a task description.",
    argsSchema: {
      // biome-ignore lint/suspicious/noExplicitAny: Required for dynamic access to Zod schema shape in MCP argsSchema
      description: (ConvertSpdToAstRequestSchema.shape as any).spd.describe(
        "Description of the logic or task to convert to SPD",
      ),
    },
  },
  async (args) => {
    const text = await handleGenerateSpdPrompt(args as { description: string });
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: text,
          },
        },
      ],
    };
  },
);

// Tools
mcpServer.registerTool(
  "get_spd_explanation",
  {
    description:
      "Get the explanation of SPD (Simple PAD Description) notation.",
  },
  async () => {
    const text = await handleGetSpdExplanationTool();
    return {
      content: [{ type: "text", text: text }],
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
      const svg = await handleConvertSpdToSvgTool(
        args as unknown as Parameters<typeof handleConvertSpdToSvgTool>[0],
      );
      return {
        content: [{ type: "text", text: svg }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error),
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
      const astJson = await handleConvertSpdToAstTool(
        args as unknown as Parameters<typeof handleConvertSpdToAstTool>[0],
      );
      return {
        content: [{ type: "text", text: JSON.stringify(astJson) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error),
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
      const svgOutput = await handleConvertAstToSvgTool(
        args as unknown as Parameters<typeof handleConvertAstToSvgTool>[0],
      );
      return {
        content: [{ type: "text", text: svgOutput }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error),
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
