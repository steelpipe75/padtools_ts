import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";

const HealthResponseSchema = z.object({
  status: z.string().openapi({
    example: "ok",
    description: "The status of the API server",
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

export const healthHandler: RouteHandler<typeof healthRoute> = (c) => {
  return c.json({ status: "ok" });
};
