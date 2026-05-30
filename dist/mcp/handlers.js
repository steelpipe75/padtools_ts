import { astUtils } from "../spd/ast.js";
import { core, } from "../spd/core.js";
import { SPD_EXPLANATION } from "../spd/docs.js";
import { ParseError, parser } from "../spd/parser.js";
/**
 * Handler for the SPD notation explanation resource.
 */
export const handleGetSpdExplanationResource = async () => {
    return {
        text: SPD_EXPLANATION,
        mimeType: "text/markdown",
    };
};
/**
 * Handler for the explain-spd prompt.
 */
export const handleExplainSpdPrompt = async () => {
    return `SPD (Simple PAD Description) 記法について説明し、いくつか具体的な記述例を提示してください。\n\nリファレンス:\n${SPD_EXPLANATION}`;
};
/**
 * Handler for the generate-spd prompt.
 */
export const handleGenerateSpdPrompt = async (args) => {
    if (!args.description) {
        throw new Error("description is required");
    }
    return `以下の処理内容を、SPD記法を使用して記述してください。\n\n処理内容:\n${args.description}\n\nSPD記法のルールと例は以下の通りです:\n${SPD_EXPLANATION}`;
};
/**
 * Handler for the get_spd_explanation tool.
 */
export const handleGetSpdExplanationTool = async () => {
    return SPD_EXPLANATION;
};
/**
 * Handler for the convert_spd_to_svg tool.
 */
export const handleConvertSpdToSvgTool = async (args) => {
    try {
        const svg = core.generateSvg(args.spd, args.options);
        return svg;
    }
    catch (error) {
        if (error instanceof ParseError) {
            throw new Error(`SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`);
        }
        throw new Error(`Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
};
/**
 * Handler for the convert_spd_to_ast tool.
 */
export const handleConvertSpdToAstTool = async (args) => {
    try {
        const astVal = parser.parse(args.spd);
        if (!astVal) {
            throw new Error("Failed to parse SPD");
        }
        // serialize to handle Map and then parse back to object for JSON response
        const astJson = JSON.parse(astUtils.serializeAST(astVal));
        return astJson;
    }
    catch (error) {
        if (error instanceof ParseError) {
            throw new Error(`SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`);
        }
        throw new Error(`Error converting SPD to AST: ${error instanceof Error ? error.message : String(error)}`);
    }
};
/**
 * Handler for the convert_ast_to_svg tool.
 */
export const handleConvertAstToSvgTool = async (args) => {
    try {
        // Convert AST object to string and then deserialize to handle Map restoration
        const astString = JSON.stringify(args.ast);
        const deserializedAst = astUtils.deserializeAST(astString);
        if (!deserializedAst) {
            throw new Error("Invalid AST format");
        }
        const svgOutput = core.generateSvgFromAst(deserializedAst, args.options);
        return svgOutput;
    }
    catch (error) {
        throw new Error(`Error converting AST to SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
};
