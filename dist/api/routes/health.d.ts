import { type RouteHandler, z } from "@hono/zod-openapi";
export declare const healthRoute: {
    method: "get";
    path: "/health";
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        status: z.ZodString;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/health";
};
export declare const healthHandler: RouteHandler<typeof healthRoute>;
