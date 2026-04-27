import { createRoute, z } from "@hono/zod-openapi";
import { optimize } from "svgo";
import xmlFormat from "xml-formatter";
import { parse } from "../../spd/parser";
import { render } from "../../spd/svg-renderer";

const ConvertRequestSchema = z.object({
  spd: z.string().openapi({
    example: "process: Start\nterminal: End",
    description: "The SPD text to convert",
  }),
  options: z
    .object({
      fontSize: z.number().optional().openapi({ description: "Font size for the SVG" }),
      fontFamily: z.string().optional().openapi({ description: "Font family for the SVG" }),
      strokeWidth: z.number().optional().openapi({ description: "Stroke width for the SVG" }),
      strokeColor: z.string().optional().openapi({ description: "Stroke color for the SVG" }),
      backgroundColor: z.string().optional().openapi({ description: "Background color for the SVG" }),
      baseBackgroundColor: z.string().optional().openapi({ description: "Base background color for the SVG" }),
      textColor: z.string().optional().openapi({ description: "Text color for the SVG" }),
      lineHeight: z.number().optional().openapi({ description: "Line height for the SVG" }),
      listRenderType: z.enum(["original", "TerminalOffset"]).optional().openapi({
        description: "List render type for the SVG",
      }),
      prettyprint: z.boolean().optional().openapi({
        description: "Whether to pretty print the SVG output",
      }),
    })
    .optional(),
});

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

export const convertHandler = async (c: any) => {
  try {
    const { spd, options = {} } = c.req.valid("json");

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const ast = parse(spd);
    const renderOptions: Parameters<typeof render>[1] = {};

    // Map options to renderOptions
    if (options.fontSize !== undefined) renderOptions.fontSize = options.fontSize;
    if (options.fontFamily !== undefined) renderOptions.fontFamily = options.fontFamily;
    if (options.strokeWidth !== undefined) renderOptions.strokeWidth = options.strokeWidth;
    if (options.strokeColor !== undefined) renderOptions.strokeColor = options.strokeColor;
    if (options.backgroundColor !== undefined) renderOptions.backgroundColor = options.backgroundColor;
    if (options.baseBackgroundColor !== undefined) renderOptions.baseBackgroundColor = options.baseBackgroundColor;
    if (options.textColor !== undefined) renderOptions.textColor = options.textColor;
    if (options.lineHeight !== undefined) renderOptions.lineHeight = options.lineHeight;
    if (options.listRenderType !== undefined) renderOptions.listRenderType = options.listRenderType as any;

    const svgOutput = render(ast, renderOptions);
    const optimizedSvg = optimize(svgOutput, {
      multipass: true,
    });

    let outputData = optimizedSvg.data;
    if (options.prettyprint) {
      outputData = xmlFormat(svgOutput);
    }

    return c.json({ svg: outputData });
  } catch (error) {
    console.error("Conversion error:", error);
    return c.json({ error: "Failed to convert SPD to SVG" }, 500);
  }
};
