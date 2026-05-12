import { type ConvertRequest, generateSvg } from "../spd/core";
import { SPD_EXPLANATION } from "../spd/docs";
import { ParseError } from "../spd/parser";

/**
 * Handler for the SPD notation explanation resource.
 */
export const handleGetSpdExplanationResource = async () => {
  return {
    text: SPD_EXPLANATION,
    mimeType: "text/markdown" as const,
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
export const handleGenerateSpdPrompt = async (args: {
  description: string;
}) => {
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
export const handleConvertSpdToSvgTool = async (args: ConvertRequest) => {
  try {
    const svg = generateSvg(args.spd, args.options);
    return svg;
  } catch (error) {
    if (error instanceof ParseError) {
      throw new Error(
        `SPD Parse Error at line ${error.lineNo}: ${error.message}\nLine content: ${error.lineStr}`,
      );
    }
    throw new Error(
      `Error converting SPD to SVG: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
