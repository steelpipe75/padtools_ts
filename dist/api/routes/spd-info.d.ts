import type { Context } from "hono";
import { z } from "zod";
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
export declare const spdInfoHandler: (c: Context) => Response & import("hono").TypedResponse<{
    explanation: string;
}, 200, "json">;
