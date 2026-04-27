import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { convertHandler, convertRoute } from "./routes/convert";

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
app.openapi(convertRoute, convertHandler);

// Handle base URL
app.get("/", (c) => {
  return c.redirect("/api-docs/");
});

export default app;

// Start server
if (require.main === module) {
  serve({
    fetch: app.fetch,
    port: port,
  });
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  console.log(`OpenAPI spec available at http://localhost:${port}/doc`);
}
