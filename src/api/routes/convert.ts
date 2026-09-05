import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";
import {
  type ConvertRequest,
  ConvertRequestSchema,
  core,
} from "../../spd/core.js";

const ConvertResponseSchema = z.object({
  svg: z.string().describe("The generated SVG content"),
});

const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
  lineNo: z
    .number()
    .optional()
    .describe("The line number where the error occurred")
    .meta({
      example: 2,
    }),
  lineStr: z
    .string()
    .optional()
    .describe("The string content of the line where the error occurred")
    .meta({
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
      required: true,
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
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "image/svg+xml": {
          schema: z.string().describe("The generated SVG file").meta({
            format: "binary",
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

export const convertHandler = async (c: Context) => {
  try {
    const { spd, options = {} } = c.req.valid(
      "json" as never,
    ) as ConvertRequest;

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const outputData = core.generateSvg(spd, options);
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

export const downloadHandler = async (c: Context) => {
  try {
    const { spd, options = {} } = c.req.valid(
      "json" as never,
    ) as ConvertRequest;

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const outputData = core.generateSvg(spd, options);

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
