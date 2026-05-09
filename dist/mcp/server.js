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
const mcp = new fastmcp_1.FastMCP({
    name: "PAD Tools",
    version: package_json_1.version,
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
