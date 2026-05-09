"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spdInfoHandler = exports.spdInfoRoute = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const docs_1 = require("../../spd/docs");
const SpdInfoResponseSchema = zod_openapi_1.z.object({
    explanation: zod_openapi_1.z.string().openapi({
        example: "SPD (Simple PAD Description) is...",
        description: "The explanation of SPD notation in Markdown format",
    }),
});
exports.spdInfoRoute = (0, zod_openapi_1.createRoute)({
    method: "get",
    path: "/spd-info",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: SpdInfoResponseSchema,
                },
            },
            description: "Returns the explanation of SPD notation",
        },
    },
});
const spdInfoHandler = (c) => {
    return c.json({ explanation: docs_1.SPD_EXPLANATION });
};
exports.spdInfoHandler = spdInfoHandler;
