import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { version } from "../../package.json";
import {
  convertHandler,
  convertRoute,
  downloadHandler,
  downloadRoute,
} from "./routes/convert";
import { healthHandler, healthRoute } from "./routes/health";

const app = new OpenAPIHono();

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "PAD Tools API",
    version: version,
    description: "API for converting SPD to SVG",
  },
});

// Swagger UI
app.get("/api-docs", (c) => c.redirect("/api-docs/"));
app.get("/api-docs/", swaggerUI({ url: "/doc" }));

// Routes
app.openapi(healthRoute, healthHandler);
app.openapi(convertRoute, convertHandler);
app.openapi(downloadRoute, downloadHandler);

// Handle base URL
app.get("/", (c) => {
  return c.redirect("/api-docs/");
});

export default app;
