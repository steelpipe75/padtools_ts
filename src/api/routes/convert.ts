import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import { ConvertRequestSchema, generateSvg } from "../../spd/core";

const ConvertResponseSchema = z.object({
  svg: z.string().openapi({
    description: "The generated SVG content",
  }),
});

const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    description: "Error message",
  }),
  lineNo: z.number().optional().openapi({
    description: "The line number where the error occurred",
    example: 2,
  }),
  lineStr: z.string().optional().openapi({
    description: "The string content of the line where the error occurred",
    example: ":invalid_command arg",
  }),
});

interface ParseErrorLike {
  message: string;
  lineNo?: number;
  lineStr?: string;
}

function isParseErrorLike(error: unknown): error is ParseErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    ("lineNo" in error ||
      "lineStr" in error ||
      (error as { name?: string }).name === "ParseError" ||
      !!(error as { name?: string }).name?.endsWith("Exception"))
  );
}

export const convertRoute = createRoute({
  method: "post",
  path: "/convert",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ConvertRequestSchema,
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

export const downloadRoute = createRoute({
  method: "post",
  path: "/convert/download",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ConvertRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "image/svg+xml": {
          schema: z.string().openapi({
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

export const convertHandler: RouteHandler<typeof convertRoute> = async (c) => {
  try {
    const { spd, options = {} } = c.req.valid("json");

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const outputData = generateSvg(spd, options);
    return c.json({ svg: outputData }, 200);
  } catch (error) {
    if (isParseErrorLike(error)) {
      console.error(
        "SPD parsing error:",
        error.message,
        "at line:",
        error.lineNo,
      );
      return c.json(
        {
          error: error.message || "Invalid SPD format",
          lineNo: error.lineNo,
          lineStr: error.lineStr,
        },
        400,
      );
    }
    console.error("Conversion error:", error);
    return c.json({ error: "Failed to convert SPD to SVG" }, 500);
  }
};

export const downloadHandler: RouteHandler<typeof downloadRoute> = async (
  c,
) => {
  try {
    const { spd, options = {} } = c.req.valid("json");

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const outputData = generateSvg(spd, options);

    c.header("Content-Type", "image/svg+xml");
    c.header("Content-Disposition", 'attachment; filename="diagram.svg"');

    return c.body(outputData);
  } catch (error) {
    if (isParseErrorLike(error)) {
      console.error(
        "SPD parsing error during download:",
        error.message,
        "at line:",
        error.lineNo,
      );
      return c.json(
        {
          error: error.message || "Invalid SPD format",
          lineNo: error.lineNo,
          lineStr: error.lineStr,
        },
        400,
      );
    }
    console.error("Download error:", error);
    return c.json({ error: "Failed to generate SVG for download" }, 500);
  }
};
