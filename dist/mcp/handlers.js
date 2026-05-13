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
exports.handleConvertSpdToSvgTool = exports.handleGetSpdExplanationTool = exports.handleGenerateSpdPrompt = exports.handleExplainSpdPrompt = exports.handleGetSpdExplanationResource = void 0;
const core_1 = require("../spd/core");
const docs_1 = require("../spd/docs");
const parser_1 = require("../spd/parser");
/**
 * Handler for the SPD notation explanation resource.
 */
const handleGetSpdExplanationResource = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        text: docs_1.SPD_EXPLANATION,
        mimeType: "text/markdown",
    };
});
exports.handleGetSpdExplanationResource = handleGetSpdExplanationResource;
/**
 * Handler for the explain-spd prompt.
 */
const handleExplainSpdPrompt = () => __awaiter(void 0, void 0, void 0, function* () {
    return `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${docs_1.SPD_EXPLANATION}`;
});
exports.handleExplainSpdPrompt = handleExplainSpdPrompt;
/**
 * Handler for the generate-spd prompt.
 */
const handleGenerateSpdPrompt = (args) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args.description) {
        throw new Error("description is required");
    }
    return `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${args.description}\n\nSPD記法のルールと例は以下の通りです:\n${docs_1.SPD_EXPLANATION}`;
});
exports.handleGenerateSpdPrompt = handleGenerateSpdPrompt;
/**
 * Handler for the get_spd_explanation tool.
 */
const handleGetSpdExplanationTool = () => __awaiter(void 0, void 0, void 0, function* () {
    return docs_1.SPD_EXPLANATION;
});
exports.handleGetSpdExplanationTool = handleGetSpdExplanationTool;
/**
 * Handler for the convert_spd_to_svg tool.
 */
const handleConvertSpdToSvgTool = (args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const svg = (0, core_1.generateSvg)(args.spd, args.options);
        return svg;
    }
    catch (error) {
        if (error instanceof parser_1.ParseError) {
            throw new Error(`SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`);
        }
        throw new Error(`Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
});
exports.handleConvertSpdToSvgTool = handleConvertSpdToSvgTool;
