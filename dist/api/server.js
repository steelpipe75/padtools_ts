"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const node_server_1 = require("@hono/node-server");
const swagger_ui_1 = require("@hono/swagger-ui");
const zod_openapi_1 = require("@hono/zod-openapi");
const package_json_1 = require("../../package.json");
const convert_1 = require("./routes/convert");
const health_1 = require("./routes/health");
const app = new zod_openapi_1.OpenAPIHono();
const port = Number(process.env.PORT) || 3000;
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
const startServer = (p) => {
    const server = (0, node_server_1.serve)({
        fetch: app.fetch,
        port: p,
    });
    console.log(`Server is running on http://localhost:${p}`);
    console.log(`Swagger UI available at http://localhost:${p}/api-docs`);
    console.log(`OpenAPI spec available at http://localhost:${p}/doc`);
    return server;
};
exports.startServer = startServer;
// Start server
if (require.main === module &&
    // @ts-expect-error: Bun is only defined in Bun environment
    typeof Bun === "undefined") {
    (0, exports.startServer)(port);
}
