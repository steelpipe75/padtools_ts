import { z } from "@hono/zod-openapi";
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
export declare const ConvertAstToSvgRequestSchema: z.ZodObject<{
    ast: z.ZodAny;
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
export declare const generateSvg: (spd: string, options?: ConvertRequestOptions) => string;
export declare const generateSvgFromAst: (ast: ReturnType<typeof parse>, options?: ConvertRequestOptions) => string;
export declare const core: {
    generateSvg: (spd: string, options?: ConvertRequestOptions) => string;
    generateSvgFromAst: (ast: ReturnType<typeof parse>, options?: ConvertRequestOptions) => string;
};
