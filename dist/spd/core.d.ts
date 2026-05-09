import { z } from "@hono/zod-openapi";
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
export declare const generateSvg: (spd: string, options?: ConvertRequestOptions) => string;
