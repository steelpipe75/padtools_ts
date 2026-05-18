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
exports.astRenderDownloadHandler = exports.astRenderHandler = exports.astParseDownloadHandler = exports.astParseHandler = exports.astRenderDownloadRoute = exports.astRenderRoute = exports.astParseDownloadRoute = exports.astParseRoute = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const ast_1 = require("../../spd/ast");
const core_1 = require("../../spd/core");
const parser_1 = require("../../spd/parser");
const ErrorResponseSchema = zod_openapi_1.z.object({
    error: zod_openapi_1.z.string().openapi({
        description: "Error message",
    }),
});
const AstParseRequestSchema = zod_openapi_1.z.object({
    spd: zod_openapi_1.z.string().openapi({
        description: "The SPD text to parse",
        example: ":terminal Start\nProcess\n:terminal End",
    }),
});
const AstParseResponseSchema = zod_openapi_1.z.object({
    ast: zod_openapi_1.z.any().openapi({
        description: "The parsed AST as JSON object",
    }),
});
const AstRenderRequestSchema = zod_openapi_1.z.object({
    ast: zod_openapi_1.z.any().openapi({
        description: "The AST JSON object to render",
    }),
    options: core_1.ConvertRequestOptionsSchema.optional(),
});
const AstRenderResponseSchema = zod_openapi_1.z.object({
    svg: zod_openapi_1.z.string().openapi({
        description: "The generated SVG content",
    }),
});
exports.astParseRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/ast/parse",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AstParseRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: AstParseResponseSchema,
                },
            },
            description: "Successful parsing",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid SPD",
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
exports.astParseDownloadRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/ast/parse/download",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AstParseRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: zod_openapi_1.z.any().openapi({
                        format: "binary",
                        description: "The parsed AST as JSON file",
                    }),
                },
            },
            description: "Successful parsing and download",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid SPD",
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
exports.astRenderRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/ast/render",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AstRenderRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: AstRenderResponseSchema,
                },
            },
            description: "Successful rendering",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid AST or options",
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
exports.astRenderDownloadRoute = (0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/ast/render/download",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AstRenderRequestSchema,
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
                        description: "The generated SVG file from AST",
                    }),
                },
            },
            description: "Successful rendering and download",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Bad request - invalid AST or options",
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
const astParseHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spd } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const ast = (0, parser_1.parse)(spd);
        if (!ast) {
            return c.json({ error: "Failed to parse SPD" }, 400);
        }
        // serialize to handle Map and then parse back to object for JSON response
        const astJson = JSON.parse((0, ast_1.serializeAST)(ast));
        return c.json({ ast: astJson }, 200);
    }
    catch (error) {
        console.error("AST parse error:", error);
        return c.json({ error: error instanceof Error ? error.message : "Failed to parse AST" }, 400);
    }
});
exports.astParseHandler = astParseHandler;
const astParseDownloadHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spd } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const ast = (0, parser_1.parse)(spd);
        if (!ast) {
            return c.json({ error: "Failed to parse SPD" }, 400);
        }
        const astString = (0, ast_1.serializeAST)(ast);
        const astJson = JSON.parse(astString);
        c.header("Content-Type", "application/json");
        c.header("Content-Disposition", 'attachment; filename="diagram.json"');
        return c.json(astJson, 200);
    }
    catch (error) {
        console.error("AST parse download error:", error);
        return c.json({
            error: error instanceof Error
                ? error.message
                : "Failed to parse AST download",
        }, 400);
    }
});
exports.astParseDownloadHandler = astParseDownloadHandler;
const astRenderHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ast, options = {} } = c.req.valid("json");
        if (!ast) {
            return c.json({ error: "AST is required" }, 400);
        }
        // Convert AST object to string and then deserialize to handle Map restoration
        const astString = JSON.stringify(ast);
        const deserializedAst = (0, ast_1.deserializeAST)(astString);
        if (!deserializedAst) {
            return c.json({ error: "Invalid AST format" }, 400);
        }
        const svgOutput = (0, core_1.generateSvgFromAst)(deserializedAst, options);
        return c.json({ svg: svgOutput }, 200);
    }
    catch (error) {
        console.error("AST render error:", error);
        return c.json({
            error: error instanceof Error ? error.message : "Failed to render AST",
        }, 500);
    }
});
exports.astRenderHandler = astRenderHandler;
const astRenderDownloadHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ast, options = {} } = c.req.valid("json");
        if (!ast) {
            return c.json({ error: "AST is required" }, 400);
        }
        // Convert AST object to string and then deserialize to handle Map restoration
        const astString = JSON.stringify(ast);
        const deserializedAst = (0, ast_1.deserializeAST)(astString);
        if (!deserializedAst) {
            return c.json({ error: "Invalid AST format" }, 400);
        }
        const svgOutput = (0, core_1.generateSvgFromAst)(deserializedAst, options);
        c.header("Content-Type", "image/svg+xml");
        c.header("Content-Disposition", 'attachment; filename="diagram.svg"');
        return c.body(svgOutput, 200);
    }
    catch (error) {
        console.error("AST render download error:", error);
        return c.json({
            error: error instanceof Error
                ? error.message
                : "Failed to render AST download",
        }, 500);
    }
});
exports.astRenderDownloadHandler = astRenderDownloadHandler;
