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
const fastmcp_1 = require("fastmcp");
const package_json_1 = require("../../package.json");
const core_1 = require("../spd/core");
const docs_1 = require("../spd/docs");
const mcp = new fastmcp_1.FastMCP({
    name: "PAD Tools",
    version: package_json_1.version,
});
mcp.addResource({
    uri: "spd://docs/explanation",
    name: "SPD Notation Explanation",
    mimeType: "text/markdown",
    description: "Explanation of SPD (Simple PAD Description) notation.",
    load: () => __awaiter(void 0, void 0, void 0, function* () {
        return {
            text: docs_1.SPD_EXPLANATION,
            mimeType: "text/markdown",
        };
    }),
});
mcp.addPrompt({
    name: "explain-spd",
    description: "Explain SPD (Simple PAD Description) notation with examples.",
    load: () => __awaiter(void 0, void 0, void 0, function* () {
        return `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${docs_1.SPD_EXPLANATION}`;
    }),
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
    load: (args) => __awaiter(void 0, void 0, void 0, function* () {
        return `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${args.description}\n\nSPD記法のルールと例は以下の通りです:\n${docs_1.SPD_EXPLANATION}`;
    }),
});
mcp.addTool({
    name: "get_spd_explanation",
    description: "Get the explanation of SPD (Simple PAD Description) notation.",
    execute: () => __awaiter(void 0, void 0, void 0, function* () {
        return docs_1.SPD_EXPLANATION;
    }),
});
mcp.addTool({
    name: "convert_spd_to_svg",
    description: "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
    parameters: core_1.ConvertRequestSchema,
    execute: (args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const svg = (0, core_1.generateSvg)(args.spd, args.options);
            return svg;
        }
        catch (error) {
            throw new Error(`Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`);
        }
    }),
});
mcp.start();
