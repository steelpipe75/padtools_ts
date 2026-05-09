import { type RouteHandler, z } from "@hono/zod-openapi";
export declare const spdInfoRoute: {
    method: "get";
    path: "/spd-info";
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        explanation: z.ZodString;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/spd-info";
};
export declare const spdInfoHandler: RouteHandler<typeof spdInfoRoute>;
