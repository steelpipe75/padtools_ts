"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_1 = require("@hono/swagger-ui");
const zod_openapi_1 = require("@hono/zod-openapi");
const package_json_1 = require("../../package.json");
const convert_1 = require("./routes/convert");
const health_1 = require("./routes/health");
const app = new zod_openapi_1.OpenAPIHono();
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
app.openapi(convert_1.convertRoute, convert_1.convertHandler);
app.openapi(convert_1.downloadRoute, convert_1.downloadHandler);
// Handle base URL
app.get("/", (c) => {
    return c.redirect("/api-docs/");
});
exports.default = app;
