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
exports.downloadHandler = exports.convertHandler = exports.downloadRoute = exports.convertRoute = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const core_1 = require("../../spd/core");
const ConvertResponseSchema = zod_openapi_1.z.object({
    svg: zod_openapi_1.z.string().openapi({
        description: "The generated SVG content",
    }),
});
const ErrorResponseSchema = zod_openapi_1.z.object({
    error: zod_openapi_1.z.string().openapi({
        description: "Error message",
    }),
});
exports.convertRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/convert",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: core_1.ConvertRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ConvertResponseSchema,
                },
            },
            description: "Successful conversion",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid SPD or options",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
});
exports.downloadRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/convert/download",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: core_1.ConvertRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "image/svg+xml": {
                    schema: zod_openapi_1.z.string().openapi({
                        format: "binary",
                        description: "The generated SVG file",
                    }),
                },
            },
            description: "Successful conversion and download",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid SPD or options",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
});
const convertHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spd, options = {} } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const outputData = (0, core_1.generateSvg)(spd, options);
        return c.json({ svg: outputData }, 200);
    }
    catch (error) {
        console.error("Conversion error:", error);
        return c.json({ error: "Failed to convert SPD to SVG" }, 500);
    }
});
exports.convertHandler = convertHandler;
const downloadHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spd, options = {} } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const outputData = (0, core_1.generateSvg)(spd, options);
        c.header("Content-Type", "image/svg+xml");
        c.header("Content-Disposition", 'attachment; filename="diagram.svg"');
        return c.body(outputData);
    }
    catch (error) {
        console.error("Download error:", error);
        return c.json({ error: "Failed to generate SVG for download" }, 500);
    }
});
exports.downloadHandler = downloadHandler;
