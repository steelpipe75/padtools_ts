import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import {
  ConvertRequestSchema,
  generateSvg,
} from "../../spd/core";

const ConvertResponseSchema = z.object({
  svg: z.string().openapi({
    description: "The generated SVG content",
  }),
});

const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    description: "Error message",
  }),
});

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
    console.error("Download error:", error);
    return c.json({ error: "Failed to generate SVG for download" }, 500);
  }
};
