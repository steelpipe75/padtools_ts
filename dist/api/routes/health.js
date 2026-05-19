"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = exports.healthRoute = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const package_json_1 = require("../../../package.json");
const HealthResponseSchema = zod_openapi_1.z.object({
    status: zod_openapi_1.z.string().openapi({
        example: "ok",
        description: "The status of the API server",
    }),
    version: zod_openapi_1.z.string().openapi({
        example: "0.1.0",
        description: "The version of the API server",
    }),
});
exports.healthRoute = (0, zod_openapi_1.createRoute)({
    method: "get",
    path: "/health",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: HealthResponseSchema,
                },
            },
            description: "API server is healthy",
        },
    },
});
const healthHandler = (c) => {
    return c.json({ status: "ok", version: package_json_1.version });
};
exports.healthHandler = healthHandler;
