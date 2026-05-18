import { type ConvertAstToSvgRequest, type ConvertRequest, type ConvertSpdToAstRequest } from "../spd/core";
/**
 * Handler for the SPD notation explanation resource.
 */
export declare const handleGetSpdExplanationResource: () => Promise<{
    text: string;
    mimeType: "text/markdown";
}>;
/**
 * Handler for the explain-spd prompt.
 */
export declare const handleExplainSpdPrompt: () => Promise<string>;
/**
 * Handler for the generate-spd prompt.
 */
export declare const handleGenerateSpdPrompt: (args: {
    description?: string;
}) => Promise<string>;
/**
 * Handler for the get_spd_explanation tool.
 */
export declare const handleGetSpdExplanationTool: () => Promise<string>;
/**
 * Handler for the convert_spd_to_svg tool.
 */
export declare const handleConvertSpdToSvgTool: (args: ConvertRequest) => Promise<string>;
/**
 * Handler for the convert_spd_to_ast tool.
 */
export declare const handleConvertSpdToAstTool: (args: ConvertSpdToAstRequest) => Promise<any>;
/**
 * Handler for the convert_ast_to_svg tool.
 */
export declare const handleConvertAstToSvgTool: (args: ConvertAstToSvgRequest) => Promise<string>;
