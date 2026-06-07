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
  ConvertAstToSvgResponseSchema,
  ConvertRequestSchema,
  ConvertSpdToAstRequestSchema,
  ConvertSpdToAstResponseSchema,
  ConvertSpdToSvgResponseSchema,
  GetSpdExplanationResponseSchema,
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
    description: "SPD（Simple PAD Description）表記法の説明。",
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
    description: "SPD（Simple PAD Description）表記法を例付きで説明します。",
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
    description: "タスクの説明からSPD（Simple PAD Description）を生成します。",
    argsSchema: {
      // biome-ignore lint/suspicious/noExplicitAny: Required for dynamic access to Zod schema shape in MCP argsSchema
      description: (ConvertSpdToAstRequestSchema.shape as any).spd.describe(
        "SPDに変換するためのロジックまたはタスクの説明",
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
    title: "SPD表記法の説明取得",
    description: "SPD（Simple PAD Description）表記法の説明を取得します。",
    inputSchema: {},
    outputSchema: GetSpdExplanationResponseSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    const text = await handleGetSpdExplanationTool();
    return {
      content: [{ type: "text", text: text }],
      structuredContent: { explanation: text },
    };
  },
);

mcpServer.registerTool(
  "convert_spd_to_svg",
  {
    title: "SPDからSVGへ変換",
    description:
      "SPD（Simple PAD Description）テキストをSVG形式のPAD図に変換します。",
    inputSchema: ConvertRequestSchema.shape,
    outputSchema: ConvertSpdToSvgResponseSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (args) => {
    try {
      const svg = await handleConvertSpdToSvgTool(
        args as unknown as Parameters<typeof handleConvertSpdToSvgTool>[0],
      );
      return {
        content: [{ type: "text", text: svg }],
        structuredContent: { svg },
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
    title: "SPDからASTへ変換",
    description:
      "SPD（Simple PAD Description）テキストをJSON形式の抽象構文木（AST）に変換します。",
    inputSchema: ConvertSpdToAstRequestSchema.shape,
    outputSchema: ConvertSpdToAstResponseSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (args) => {
    try {
      const astJson = await handleConvertSpdToAstTool(
        args as unknown as Parameters<typeof handleConvertSpdToAstTool>[0],
      );
      return {
        content: [{ type: "text", text: JSON.stringify(astJson) }],
        structuredContent: { ast: JSON.stringify(astJson) },
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
    title: "ASTからSVGへ変換",
    description: "JSON形式の抽象構文木（AST）をSVG形式のPAD図に変換します。",
    inputSchema: ConvertAstToSvgRequestSchema.shape,
    outputSchema: ConvertAstToSvgResponseSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (args) => {
    try {
      const svgOutput = await handleConvertAstToSvgTool(
        args as unknown as Parameters<typeof handleConvertAstToSvgTool>[0],
      );
      return {
        content: [{ type: "text", text: svgOutput }],
        structuredContent: { svg: svgOutput },
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

const transport = new StreamableHTTPTransport({
  strictAcceptHeader: true,
});

export const mcpHandler = async (c: Context) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
};
