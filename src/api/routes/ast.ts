import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import { serializeAST, deserializeAST } from "../../spd/ast";
import { parse } from "../../spd/parser";
import { ConvertRequestOptionsSchema, generateSvgFromAst } from "../../spd/core";

const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    description: "Error message",
  }),
});

const AstParseRequestSchema = z.object({
  spd: z.string().openapi({
    description: "The SPD text to parse",
    example: ":terminal Start\nProcess\n:terminal End",
  }),
});

const AstParseResponseSchema = z.object({
  ast: z.any().openapi({
    description: "The parsed AST as JSON object",
  }),
});

const AstRenderRequestSchema = z.object({
  ast: z.any().openapi({
    description: "The AST JSON object to render",
  }),
  options: ConvertRequestOptionsSchema.optional(),
});

const AstRenderResponseSchema = z.object({
  svg: z.string().openapi({
    description: "The generated SVG content",
  }),
});

export const astParseRoute = createRoute({
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

export const astRenderRoute = createRoute({
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

export const astParseHandler: RouteHandler<typeof astParseRoute> = async (c) => {
  try {
    const { spd } = c.req.valid("json");
    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const ast = parse(spd);
    if (!ast) {
        return c.json({ error: "Failed to parse SPD" }, 400);
    }
    
    // serialize to handle Map and then parse back to object for JSON response
    const astJson = JSON.parse(serializeAST(ast));
    return c.json({ ast: astJson }, 200);
  } catch (error) {
    console.error("AST parse error:", error);
    return c.json({ error: error instanceof Error ? error.message : "Failed to parse AST" }, 400);
  }
};

export const astRenderHandler: RouteHandler<typeof astRenderRoute> = async (c) => {
  try {
    const { ast, options = {} } = c.req.valid("json");
    if (!ast) {
      return c.json({ error: "AST is required" }, 400);
    }

    // Convert AST object to string and then deserialize to handle Map restoration
    const astString = JSON.stringify(ast);
    const deserializedAst = deserializeAST(astString);
    
    if (!deserializedAst) {
        return c.json({ error: "Invalid AST format" }, 400);
    }

    const svgOutput = generateSvgFromAst(deserializedAst, options);
    return c.json({ svg: svgOutput }, 200);
  } catch (error) {
    console.error("AST render error:", error);
    return c.json({ error: error instanceof Error ? error.message : "Failed to render AST" }, 500);
  }
};
