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
const zod_1 = require("zod");
const package_json_1 = require("../../../package.json");
const core_1 = require("../../spd/core");
const docs_1 = require("../../spd/docs");
const mcpServer = new mcp_js_1.McpServer({
    name: "PAD Tools",
    version: package_json_1.version,
});
// Resource
mcpServer.resource("spd-explanation", "spd://docs/explanation", {
    mimeType: "text/markdown",
    description: "Explanation of SPD (Simple PAD Description) notation.",
}, (uri) => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        contents: [
            {
                uri: uri.href,
                text: docs_1.SPD_EXPLANATION,
                mimeType: "text/markdown",
            },
        ],
    });
}));
// Prompts
mcpServer.prompt("explain-spd", "Explain SPD (Simple PAD Description) notation with examples.", {}, () => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${docs_1.SPD_EXPLANATION}`,
                },
            },
        ],
    });
}));
mcpServer.prompt("generate-spd", "Generate SPD (Simple PAD Description) from a task description.", {
    description: zod_1.z
        .string()
        .describe("Description of the logic or task to convert to SPD"),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ description }) {
    return ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${description}\n\nSPD記法のルールと例は以下の通りです:\n${docs_1.SPD_EXPLANATION}`,
                },
            },
        ],
    });
}));
// Tools
mcpServer.tool("get_spd_explanation", "Get the explanation of SPD (Simple PAD Description) notation.", {}, () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        content: [{ type: "text", text: docs_1.SPD_EXPLANATION }],
    };
}));
mcpServer.tool("convert_spd_to_svg", "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.", core_1.ConvertRequestSchema.shape, (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const svg = (0, core_1.generateSvg)(args.spd, args.options);
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
                    text: `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`,
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
