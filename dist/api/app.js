import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler, validator as zValidator } from "hono-openapi";
import { cors } from "hono/cors";
import { getRequire } from "../utils/compat.js";
import { ConvertRequestSchema } from "../spd/core.js";
const cjsRequire = getRequire();
const packageJson = cjsRequire("../../package.json");
const { version } = packageJson;
import { AstParseRequestSchema, AstRenderRequestSchema, astParseDownloadHandler, astParseDownloadRoute, astParseHandler, astParseRoute, astRenderDownloadHandler, astRenderDownloadRoute, astRenderHandler, astRenderRoute, } from "./routes/ast.js";
import { convertHandler, convertRoute, downloadHandler, downloadRoute, } from "./routes/convert.js";
import { healthHandler, healthRoute } from "./routes/health.js";
import { mcpHandler } from "./routes/mcp.js";
import { spdInfoHandler, spdInfoRoute } from "./routes/spd-info.js";
const app = new Hono();
// Disable caching for all routes
app.use("*", async (c, next) => {
    await next();
    c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    c.header("Pragma", "no-cache");
    c.header("Expires", "0");
});
// CORS for MCP
app.use("/mcp", cors());
// OpenAPI documentation
app.get("/openapi.json", openAPIRouteHandler(app, {
    documentation: {
        openapi: "3.0.0",
        info: {
            title: "PAD Tools API",
            version: version,
            description: "API for converting SPD to SVG",
        },
    },
}));
// Swagger UI
app.get("/docs", (c) => c.redirect("/docs/"));
app.get("/docs/", swaggerUI({ url: "/openapi.json" }));
// Routes
app.get("/health", healthRoute, healthHandler);
app.get("/spd-info", spdInfoRoute, spdInfoHandler);
app.post("/convert", convertRoute, zValidator("json", ConvertRequestSchema), convertHandler);
app.post("/convert/download", downloadRoute, zValidator("json", ConvertRequestSchema), downloadHandler);
app.post("/ast/parse", astParseRoute, zValidator("json", AstParseRequestSchema), astParseHandler);
app.post("/ast/parse/download", astParseDownloadRoute, zValidator("json", AstParseRequestSchema), astParseDownloadHandler);
app.post("/ast/render", astRenderRoute, zValidator("json", AstRenderRequestSchema), astRenderHandler);
app.post("/ast/render/download", astRenderDownloadRoute, zValidator("json", AstRenderRequestSchema), astRenderDownloadHandler);
// MCP Route
app.all("/mcp", mcpHandler);
// Handle base URL
app.get("/", (c) => {
    return c.redirect("/docs/");
});
export default app;
