import { OpenAPIHono } from "@hono/zod-openapi";
declare const app: OpenAPIHono<import("hono").Env, {}, "/">;
export default app;
