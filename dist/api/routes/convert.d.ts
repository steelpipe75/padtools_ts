import type { Context } from "hono";
export declare const convertRoute: import("hono").MiddlewareHandler;
export declare const downloadRoute: import("hono").MiddlewareHandler;
export declare const convertHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    svg: string;
}, 200, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const downloadHandler: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<string, import("hono/utils/http-status").ContentfulStatusCode, "body">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
