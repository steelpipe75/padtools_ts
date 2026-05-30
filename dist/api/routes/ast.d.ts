import type { Context } from "hono";
import { z } from "zod";
export declare const AstParseRequestSchema: z.ZodObject<{
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
export declare const AstRenderRequestSchema: z.ZodObject<{
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
export declare const astParseRoute: import("hono").MiddlewareHandler;
export declare const astParseDownloadRoute: import("hono").MiddlewareHandler;
export declare const astRenderRoute: import("hono").MiddlewareHandler;
export declare const astRenderDownloadRoute: import("hono").MiddlewareHandler;
export declare const astParseHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    ast: any;
}, 200, "json">)>;
export declare const astParseDownloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<any, 200, "json">)>;
export declare const astRenderHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    svg: string;
}, 200, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const astRenderDownloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<string, 200, "body">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
