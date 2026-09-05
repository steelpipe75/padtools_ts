import type { Context } from "hono";
import { z } from "zod";
export declare const convertRoute: {
    method: "post";
    path: "/convert";
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
                            title: z.ZodOptional<z.ZodString>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                };
            };
            required: true;
        };
    };
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        svg: z.ZodString;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
        400: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        error: z.ZodString;
                        lineNo: z.ZodOptional<z.ZodNumber>;
                        lineStr: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
        500: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        error: z.ZodString;
                        lineNo: z.ZodOptional<z.ZodNumber>;
                        lineStr: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/convert";
};
export declare const downloadRoute: {
    method: "post";
    path: "/convert/download";
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
                            title: z.ZodOptional<z.ZodString>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                };
            };
            required: true;
        };
    };
    responses: {
        200: {
            content: {
                "image/svg+xml": {
                    schema: z.ZodString;
                };
            };
            description: string;
        };
        400: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        error: z.ZodString;
                        lineNo: z.ZodOptional<z.ZodNumber>;
                        lineStr: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
        500: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        error: z.ZodString;
                        lineNo: z.ZodOptional<z.ZodNumber>;
                        lineStr: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/convert/download";
};
export declare const convertHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    svg: string;
}, 200, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const downloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<string, import("hono/utils/http-status").ContentfulStatusCode, "body">)>;
