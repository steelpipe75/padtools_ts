import { z } from "zod";
import { parse } from "./parser.js";
export declare const ConvertRequestOptionsSchema: z.ZodObject<{
    fontSize: z.ZodOptional<z.ZodNumber>;
    fontFamily: z.ZodOptional<z.ZodString>;
    strokeWidth: z.ZodOptional<z.ZodNumber>;
    strokeColor: z.ZodOptional<z.ZodString>;
    backgroundColor: z.ZodOptional<z.ZodString>;
    baseBackgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    lineHeight: z.ZodOptional<z.ZodNumber>;
    listRenderType: z.ZodOptional<z.ZodEnum<{
        Original: "Original";
        TerminalOffset: "TerminalOffset";
    }>>;
    prettyprint: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type ConvertRequestOptions = z.infer<typeof ConvertRequestOptionsSchema>;
export declare const ConvertRequestSchema: z.ZodObject<{
    spd: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        fontFamily: z.ZodOptional<z.ZodString>;
        strokeWidth: z.ZodOptional<z.ZodNumber>;
        strokeColor: z.ZodOptional<z.ZodString>;
        backgroundColor: z.ZodOptional<z.ZodString>;
        baseBackgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        lineHeight: z.ZodOptional<z.ZodNumber>;
        listRenderType: z.ZodOptional<z.ZodEnum<{
            Original: "Original";
            TerminalOffset: "TerminalOffset";
        }>>;
        prettyprint: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ConvertRequest = z.infer<typeof ConvertRequestSchema>;
export declare const ConvertSpdToAstRequestSchema: z.ZodObject<{
    spd: z.ZodString;
}, z.core.$strip>;
export type ConvertSpdToAstRequest = z.infer<typeof ConvertSpdToAstRequestSchema>;
interface AstNode {
    type: "process" | "if" | "loop" | "call" | "terminal" | "comment" | "switch" | "list";
    text: string;
    childNode?: AstNode | null;
    trueNode?: AstNode | null;
    falseNode?: AstNode | null;
    isWhile?: boolean;
    cases?: AstNode[];
    nodes?: AstNode[];
}
export declare const AstNodeSchema: z.ZodType<AstNode>;
export declare const ConvertAstToSvgRequestSchema: z.ZodObject<{
    ast: z.ZodObject<{}, z.core.$strip>;
    options: z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        fontFamily: z.ZodOptional<z.ZodString>;
        strokeWidth: z.ZodOptional<z.ZodNumber>;
        strokeColor: z.ZodOptional<z.ZodString>;
        backgroundColor: z.ZodOptional<z.ZodString>;
        baseBackgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        lineHeight: z.ZodOptional<z.ZodNumber>;
        listRenderType: z.ZodOptional<z.ZodEnum<{
            Original: "Original";
            TerminalOffset: "TerminalOffset";
        }>>;
        prettyprint: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ConvertAstToSvgRequest = z.infer<typeof ConvertAstToSvgRequestSchema>;
export declare const GetSpdExplanationResponseSchema: z.ZodObject<{
    explanation: z.ZodString;
}, z.core.$strip>;
export declare const ConvertSpdToSvgResponseSchema: z.ZodObject<{
    svg: z.ZodString;
}, z.core.$strip>;
export declare const ConvertSpdToAstResponseSchema: z.ZodObject<{
    ast: z.ZodString;
}, z.core.$strip>;
export declare const ConvertAstToSvgResponseSchema: z.ZodObject<{
    svg: z.ZodString;
}, z.core.$strip>;
export declare const generateSvg: (spd: string, options?: ConvertRequestOptions) => string;
export declare const generateSvgFromAst: (ast: ReturnType<typeof parse>, options?: ConvertRequestOptions) => string;
export declare const core: {
    generateSvg: (spd: string, options?: ConvertRequestOptions) => string;
    generateSvgFromAst: (ast: ReturnType<typeof parse>, options?: ConvertRequestOptions) => string;
};
export {};
