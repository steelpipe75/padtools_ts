import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { convertHandler, convertRoute } from "./routes/convert";
import { healthHandler, healthRoute } from "./routes/health";

const app = new OpenAPIHono();

const port = Number(process.env.PORT) || 3000;

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "PAD Tools API",
    version: "1.0.0",
    description: "API for converting SPD to SVG",
  },
});

// Swagger UI
app.get("/api-docs", (c) => c.redirect("/api-docs/"));
app.get("/api-docs/", swaggerUI({ url: "/doc" }));

// Routes
app.openapi(healthRoute, healthHandler);
app.openapi(convertRoute, convertHandler);

// Handle base URL
app.get("/", (c) => {
  return c.redirect("/api-docs/");
});

export default app;

export const startServer = (p: number) => {
  const server = serve({
    fetch: app.fetch,
    port: p,
  });
  console.log(`Server is running on http://localhost:${p}`);
  console.log(`Swagger UI available at http://localhost:${p}/api-docs`);
  console.log(`OpenAPI spec available at http://localhost:${p}/doc`);
  return server;
};

// Start server
if (require.main === module) {
  startServer(port);
}
