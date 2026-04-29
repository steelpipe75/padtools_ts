import { OpenAPIHono } from "@hono/zod-openapi";
declare const app: OpenAPIHono<import("hono").Env, {}, "/">;
export default app;
export declare const startServer: (p: number) => import("@hono/node-server").ServerType;
