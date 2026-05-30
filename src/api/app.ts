import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { getRequire } from "../utils/compat.js";

const cjsRequire = getRequire();
const packageJson = cjsRequire("../../package.json");
const { version } = packageJson;

import {
  astParseDownloadHandler,
  astParseDownloadRoute,
  astParseHandler,
  astParseRoute,
  astRenderDownloadHandler,
  astRenderDownloadRoute,
  astRenderHandler,
  astRenderRoute,
} from "./routes/ast.js";
import {
  convertHandler,
  convertRoute,
  downloadHandler,
  downloadRoute,
} from "./routes/convert.js";
import { healthHandler, healthRoute } from "./routes/health.js";
import { mcpHandler } from "./routes/mcp.js";
import { spdInfoHandler, spdInfoRoute } from "./routes/spd-info.js";

const app = new OpenAPIHono();

// Disable caching for all routes
app.use("*", async (c, next) => {
  await next();
  c.header(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");
});

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
app.openapi(astParseDownloadRoute, astParseDownloadHandler);
app.openapi(astRenderRoute, astRenderHandler);
app.openapi(astRenderDownloadRoute, astRenderDownloadHandler);

// MCP Route
app.all("/mcp", mcpHandler);

// Handle base URL
app.get("/", (c) => {
  return c.redirect("/docs/");
});

export default app;
