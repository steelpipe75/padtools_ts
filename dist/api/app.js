"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Disable caching for all routes
app.use("*", (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    c.header("Pragma", "no-cache");
    c.header("Expires", "0");
}));
// CORS for MCP
app.use("/mcp", (0, cors_1.cors)());
// OpenAPI documentation
app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
        title: "PAD Tools API",
        version: package_json_1.version,
        description: "API for converting SPD to SVG",
    },
});
// Swagger UI
app.get("/docs", (c) => c.redirect("/docs/"));
app.get("/docs/", (0, swagger_ui_1.swaggerUI)({ url: "/openapi.json" }));
// Routes
app.openapi(health_1.healthRoute, health_1.healthHandler);
app.openapi(spd_info_1.spdInfoRoute, spd_info_1.spdInfoHandler);
app.openapi(convert_1.convertRoute, convert_1.convertHandler);
app.openapi(convert_1.downloadRoute, convert_1.downloadHandler);
app.openapi(ast_1.astParseRoute, ast_1.astParseHandler);
app.openapi(ast_1.astParseDownloadRoute, ast_1.astParseDownloadHandler);
app.openapi(ast_1.astRenderRoute, ast_1.astRenderHandler);
app.openapi(ast_1.astRenderDownloadRoute, ast_1.astRenderDownloadHandler);
// MCP Route
app.all("/mcp", mcp_1.mcpHandler);
// Handle base URL
app.get("/", (c) => {
    return c.redirect("/docs/");
});
exports.default = app;
