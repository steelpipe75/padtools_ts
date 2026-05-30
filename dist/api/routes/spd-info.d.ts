import type { Context } from "hono";
export declare const spdInfoRoute: import("hono").MiddlewareHandler;
export declare const spdInfoHandler: (c: Context) => Response & import("hono").TypedResponse<{
    explanation: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">;
