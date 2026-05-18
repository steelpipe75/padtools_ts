"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpHandler = void 0;
const mcp_1 = require("@hono/mcp");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const package_json_1 = require("../../../package.json");
const handlers_1 = require("../../mcp/handlers");
const core_1 = require("../../spd/core");
const mcpServer = new mcp_js_1.McpServer({
    name: "PAD Tools",
    version: package_json_1.version,
});
// Resource
mcpServer.registerResource("spd-explanation", "spd://docs/explanation", {
    mimeType: "text/markdown",
    description: "Explanation of SPD (Simple PAD Description) notation.",
}, (uri) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, handlers_1.handleGetSpdExplanationResource)();
    return {
        contents: [
            {
                uri: uri.href,
                text: result.text,
                mimeType: result.mimeType,
            },
        ],
    };
}));
// Prompts
mcpServer.registerPrompt("explain-spd", {
    description: "Explain SPD (Simple PAD Description) notation with examples.",
}, () => __awaiter(void 0, void 0, void 0, function* () {
    const text = yield (0, handlers_1.handleExplainSpdPrompt)();
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
}));
mcpServer.registerPrompt("generate-spd", {
    description: "Generate SPD (Simple PAD Description) from a task description.",
    argsSchema: {
        // biome-ignore lint/suspicious/noExplicitAny: Required for dynamic access to Zod schema shape in MCP argsSchema
        description: core_1.ConvertSpdToAstRequestSchema.shape.spd.describe("Description of the logic or task to convert to SPD"),
    },
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    const text = yield (0, handlers_1.handleGenerateSpdPrompt)(args);
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
}));
// Tools
mcpServer.registerTool("get_spd_explanation", {
    description: "Get the explanation of SPD (Simple PAD Description) notation.",
}, () => __awaiter(void 0, void 0, void 0, function* () {
    const text = yield (0, handlers_1.handleGetSpdExplanationTool)();
    return {
        content: [{ type: "text", text: text }],
    };
}));
mcpServer.registerTool("convert_spd_to_svg", {
    description: "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
    inputSchema: core_1.ConvertRequestSchema.shape,
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const svg = yield (0, handlers_1.handleConvertSpdToSvgTool)(args);
        return {
            content: [{ type: "text", text: svg }],
        };
    }
    catch (error) {
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
}));
mcpServer.registerTool("convert_spd_to_ast", {
    description: "Convert SPD (Simple PAD Description) text to its Abstract Syntax Tree (AST) in JSON format.",
    inputSchema: core_1.ConvertSpdToAstRequestSchema.shape,
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const astJson = yield (0, handlers_1.handleConvertSpdToAstTool)(args);
        return {
            content: [{ type: "text", text: JSON.stringify(astJson) }],
        };
    }
    catch (error) {
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
}));
mcpServer.registerTool("convert_ast_to_svg", {
    description: "Convert an Abstract Syntax Tree (AST) in JSON format to a PAD diagram in SVG format.",
    inputSchema: core_1.ConvertAstToSvgRequestSchema.shape,
}, (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const svgOutput = yield (0, handlers_1.handleConvertAstToSvgTool)(args);
        return {
            content: [{ type: "text", text: svgOutput }],
        };
    }
    catch (error) {
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
}));
const transport = new mcp_1.StreamableHTTPTransport();
const mcpHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mcpServer.isConnected()) {
        yield mcpServer.connect(transport);
    }
    return transport.handleRequest(c);
});
exports.mcpHandler = mcpHandler;
