import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { version } from "../../package.json";
import {
  astParseHandler,
  astParseRoute,
  astRenderHandler,
  astRenderRoute,
} from "./routes/ast";
import {
  convertHandler,
  convertRoute,
  downloadHandler,
  downloadRoute,
} from "./routes/convert";
import { healthHandler, healthRoute } from "./routes/health";
import { mcpHandler } from "./routes/mcp";
import { spdInfoHandler, spdInfoRoute } from "./routes/spd-info";

const app = new OpenAPIHono();

// CORS for MCP
app.use("/mcp", cors());

// OpenAPI documentation
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "PAD Tools API",
    version: version,
    description: "API for converting SPD to SVG",
  },
});

// Swagger UI
app.get("/docs", (c) => c.redirect("/docs/"));
app.get("/docs/", swaggerUI({ url: "/openapi.json" }));

// Routes
app.openapi(healthRoute, healthHandler);
app.openapi(spdInfoRoute, spdInfoHandler);
app.openapi(convertRoute, convertHandler);
app.openapi(downloadRoute, downloadHandler);
app.openapi(astParseRoute, astParseHandler);
app.openapi(astRenderRoute, astRenderHandler);

// MCP Route
app.all("/mcp", mcpHandler);

// Handle base URL
app.get("/", (c) => {
  return c.redirect("/docs/");
});

export default app;
