import { type RouteHandler, z } from "@hono/zod-openapi";
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
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                };
            };
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
    getRoutingPath(): "/convert/download";
};
export declare const convertHandler: RouteHandler<typeof convertRoute>;
export declare const downloadHandler: RouteHandler<typeof downloadRoute>;
