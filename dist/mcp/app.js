"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcp = void 0;
const fastmcp_1 = require("fastmcp");
const package_json_1 = require("../../package.json");
const core_1 = require("../spd/core");
const handlers_1 = require("./handlers");
exports.mcp = new fastmcp_1.FastMCP({
    name: "PAD Tools",
    version: package_json_1.version,
});
exports.mcp.addResource({
    uri: "spd://docs/explanation",
    name: "SPD Notation Explanation",
    mimeType: "text/markdown",
    description: "Explanation of SPD (Simple PAD Description) notation.",
    load: handlers_1.handleGetSpdExplanationResource,
});
exports.mcp.addPrompt({
    name: "explain-spd",
    description: "Explain SPD (Simple PAD Description) notation with examples.",
    load: handlers_1.handleExplainSpdPrompt,
});
exports.mcp.addPrompt({
    name: "generate-spd",
    description: "Generate SPD (Simple PAD Description) from a task description.",
    arguments: [
        {
            name: "description",
            description: "Description of the logic or task to convert to SPD",
            required: true,
        },
    ],
    load: handlers_1.handleGenerateSpdPrompt,
});
exports.mcp.addTool({
    name: "get_spd_explanation",
    description: "Get the explanation of SPD (Simple PAD Description) notation.",
    execute: handlers_1.handleGetSpdExplanationTool,
});
exports.mcp.addTool({
    name: "convert_spd_to_svg",
    description: "Convert SPD (Simple PAD Description) text to a PAD diagram in SVG format.",
    parameters: core_1.ConvertRequestSchema,
    execute: handlers_1.handleConvertSpdToSvgTool,
});
