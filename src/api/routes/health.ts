import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import { getRequire } from "../../utils/compat.js";

const cjsRequire = getRequire();
const packageJson = cjsRequire("../../../package.json");
const { version } = packageJson;

const HealthResponseSchema = z.object({
  status: z.string().describe("The status of the API server").meta({
    example: "ok",
  }),
  version: z.string().describe("The version of the API server").meta({
    example: "0.1.0",
  }),
});

export const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
      description: "API server is healthy",
    },
  },
});

export const healthHandler = (c: Context) => {
  return c.json({ status: "ok", version }, 200);
};
