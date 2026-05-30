import { z } from "zod";
import { describeRoute, resolver } from "hono-openapi";
import { astUtils } from "../../spd/ast.js";
import { ConvertRequestOptionsSchema, generateSvgFromAst, } from "../../spd/core.js";
import { parser } from "../../spd/parser.js";
const ErrorResponseSchema = z.object({
    error: z.string().describe("Error message"),
});
export const AstParseRequestSchema = z.object({
    spd: z
        .string()
        .describe("The SPD text to parse")
        .meta({
        example: ":terminal Start\nProcess\n:terminal End",
    }),
    options: ConvertRequestOptionsSchema.optional(),
});
const AstParseResponseSchema = z.object({
    ast: z.any().describe("The parsed AST as JSON object"),
});
export const AstRenderRequestSchema = z.object({
    ast: z.any().describe("The AST JSON object to render"),
    options: ConvertRequestOptionsSchema.optional(),
});
const AstRenderResponseSchema = z.object({
    svg: z.string().describe("The generated SVG content"),
});
export const astParseRoute = describeRoute({
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: resolver(AstParseResponseSchema),
                },
            },
            description: "Successful parsing",
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - invalid SPD",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
});
export const astParseDownloadRoute = describeRoute({
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: resolver(z.any().describe("The parsed AST as JSON file").meta({
                        format: "binary",
                    })),
                },
            },
            description: "Successful parsing and download",
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - invalid SPD",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
});
export const astRenderRoute = describeRoute({
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: resolver(AstRenderResponseSchema),
                },
            },
            description: "Successful rendering",
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - invalid AST or options",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
});
export const astRenderDownloadRoute = describeRoute({
    responses: {
        200: {
            content: {
                "image/svg+xml": {
                    schema: resolver(z.string().describe("The generated SVG file from AST").meta({
                        format: "binary",
                    })),
                },
            },
            description: "Successful rendering and download",
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - invalid AST or options",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
});
export const astParseHandler = async (c) => {
    try {
        const { spd, options = {} } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const ast = parser.parse(spd);
        if (!ast) {
            return c.json({ error: "Failed to parse SPD" }, 400);
        }
        // serialize to handle Map and then parse back to object for JSON response
        const astJson = JSON.parse(astUtils.serializeAST(ast, options.prettyprint ? 2 : undefined));
        return c.json({ ast: astJson }, 200);
    }
    catch (error) {
        console.error("AST parse error:", error);
        return c.json({ error: error instanceof Error ? error.message : "Failed to parse AST" }, 400);
    }
};
export const astParseDownloadHandler = async (c) => {
    try {
        const { spd, options = {} } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const ast = parser.parse(spd);
        if (!ast) {
            return c.json({ error: "Failed to parse SPD" }, 400);
        }
        const astString = astUtils.serializeAST(ast, options.prettyprint ? 2 : undefined);
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
};
export const astRenderHandler = async (c) => {
    try {
        const { ast, options = {} } = c.req.valid("json");
        if (!ast) {
            return c.json({ error: "AST is required" }, 400);
        }
        // Convert AST object to string and then deserialize to handle Map restoration
        const astString = JSON.stringify(ast);
        const deserializedAst = astUtils.deserializeAST(astString);
        if (!deserializedAst) {
            return c.json({ error: "Invalid AST format" }, 400);
        }
        const svgOutput = generateSvgFromAst(deserializedAst, options);
        return c.json({ svg: svgOutput }, 200);
    }
    catch (error) {
        console.error("AST render error:", error);
        return c.json({
            error: error instanceof Error ? error.message : "Failed to render AST",
        }, 500);
    }
};
export const astRenderDownloadHandler = async (c) => {
    try {
        const { ast, options = {} } = c.req.valid("json");
        if (!ast) {
            return c.json({ error: "AST is required" }, 400);
        }
        // Convert AST object to string and then deserialize to handle Map restoration
        const astString = JSON.stringify(ast);
        const deserializedAst = astUtils.deserializeAST(astString);
        if (!deserializedAst) {
            return c.json({ error: "Invalid AST format" }, 400);
        }
        const svgOutput = generateSvgFromAst(deserializedAst, options);
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
};
