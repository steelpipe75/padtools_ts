"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_1 = require("@hono/swagger-ui");
const zod_openapi_1 = require("@hono/zod-openapi");
const cors_1 = require("hono/cors");
const package_json_1 = require("../../package.json");
const ast_1 = require("./routes/ast");
const convert_1 = require("./routes/convert");
const health_1 = require("./routes/health");
const mcp_1 = require("./routes/mcp");
const spd_info_1 = require("./routes/spd-info");
const app = new zod_openapi_1.OpenAPIHono();
// CORS for MCP
app.use("/mcp", (0, cors_1.cors)());
// OpenAPI documentation
app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "PAD Tools API",
        version: package_json_1.version,
        description: "API for converting SPD to SVG",
    },
});
// Swagger UI
app.get("/api-docs", (c) => c.redirect("/api-docs/"));
app.get("/api-docs/", (0, swagger_ui_1.swaggerUI)({ url: "/doc" }));
// Routes
app.openapi(health_1.healthRoute, health_1.healthHandler);
app.openapi(spd_info_1.spdInfoRoute, spd_info_1.spdInfoHandler);
app.openapi(convert_1.convertRoute, convert_1.convertHandler);
app.openapi(convert_1.downloadRoute, convert_1.downloadHandler);
app.openapi(ast_1.astParseRoute, ast_1.astParseHandler);
app.openapi(ast_1.astRenderRoute, ast_1.astRenderHandler);
// MCP Route
app.all("/mcp", mcp_1.mcpHandler);
// Handle base URL
app.get("/", (c) => {
    return c.redirect("/api-docs/");
});
exports.default = app;
