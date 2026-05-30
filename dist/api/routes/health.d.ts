import type { Context } from "hono";
export declare const healthRoute: import("hono").MiddlewareHandler;
export declare const healthHandler: (c: Context) => Response & import("hono").TypedResponse<{
    status: string;
    version: any;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">;
