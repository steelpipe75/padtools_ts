import { type RouteHandler, z } from "@hono/zod-openapi";
export declare const astParseRoute: {
    method: "post";
    path: "/ast/parse";
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        spd: z.ZodString;
                    }, z.core.$strip>;
                };
            };
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
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                };
            };
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
export declare const astParseHandler: RouteHandler<typeof astParseRoute>;
export declare const astRenderHandler: RouteHandler<typeof astRenderRoute>;
