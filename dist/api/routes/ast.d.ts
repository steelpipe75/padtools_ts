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
        title: z.ZodOptional<z.ZodString>;
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
        title: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const astParseRoute: {
    method: "post";
    path: "/ast/parse";
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
                        ast: z.ZodAny;
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
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/ast/parse";
};
export declare const astParseDownloadRoute: {
    method: "post";
    path: "/ast/parse/download";
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
                    schema: z.ZodAny;
                };
            };
            description: string;
        };
        400: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        error: z.ZodString;
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
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/ast/parse/download";
};
export declare const astRenderRoute: {
    method: "post";
    path: "/ast/render";
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/ast/render";
};
export declare const astRenderDownloadRoute: {
    method: "post";
    path: "/ast/render/download";
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/ast/render/download";
};
export declare const astParseHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    ast: any;
}, 200, "json">)>;
export declare const astParseDownloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<any, 200, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">)>;
export declare const astRenderHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    svg: string;
}, 200, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const astRenderDownloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<string, 200, "body">)>;
