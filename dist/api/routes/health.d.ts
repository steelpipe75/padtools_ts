import type { Context } from "hono";
import { z } from "zod";
export declare const healthRoute: {
    method: "get";
    path: "/health";
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        status: z.ZodString;
                        version: z.ZodString;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/health";
};
export declare const healthHandler: (c: Context) => Response & import("hono").TypedResponse<{
    status: string;
    version: any;
}, 200, "json">;
