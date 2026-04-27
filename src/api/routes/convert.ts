import { createRoute, z } from "@hono/zod-openapi";
import { optimize } from "svgo";
import xmlFormat from "xml-formatter";
import { parse } from "../../spd/parser";
import { render } from "../../spd/svg-renderer";

const ConvertRequestSchema = z.object({
  spd: z.string().openapi({
    example: `:terminal 開始
命令
:comment コメント文
:call 関数呼び出し
	中身
:if 条件式
	真の場合
:else
	偽の場合(:else以下は省略可能)
:switch 条件
:case ケース1
	ケース1の中身
:case ケース2
	ケース2の中身
:case ...
	ケース文は必要に応じていくつでも追加できます
:while 繰り返し条件（先判定）
	中身
:dowhile 繰り返し条件（後判定）
	中身
:terminal 終了`,
    description: "The SPD text to convert",
  }),
  options: z
    .object({
      fontSize: z.number().optional().openapi({ description: "Font size for the SVG", example: 14 }),
      fontFamily: z.string().optional().openapi({ description: "Font family for the SVG", example: "monospace" }),
      strokeWidth: z.number().optional().openapi({ description: "Stroke width for the SVG", example: 1 }),
      strokeColor: z.string().optional().openapi({ description: "Stroke color for the SVG", example: "#000000" }),
      backgroundColor: z.string().optional().openapi({ description: "Background color for the SVG", example: "#ffffff" }),
      baseBackgroundColor: z.string().optional().openapi({ description: "Base background color for the SVG", example: "none" }),
      textColor: z.string().optional().openapi({ description: "Text color for the SVG", example: "#000000" }),
      lineHeight: z.number().optional().openapi({ description: "Line height for the SVG", example: 1.2 }),
      listRenderType: z.enum(["Original", "TerminalOffset"]).optional().openapi({
        description: "List render type for the SVG",
        example: "TerminalOffset",
      }),
      prettyprint: z.boolean().optional().openapi({
        description: "Whether to pretty print the SVG output",
        example: true,
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

const generateSvg = (spd: string, options: any) => {
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

  if (options.prettyprint) {
    return xmlFormat(svgOutput);
  }

  const optimizedSvg = optimize(svgOutput, {
    multipass: true,
  });
  return optimizedSvg.data;
};

export const convertHandler = async (c: any) => {
  try {
    const { spd, options = {} } = c.req.valid("json");

    if (!spd) {
      return c.json({ error: "SPD content is required" }, 400);
    }

    const outputData = generateSvg(spd, options);
    return c.json({ svg: outputData });
  } catch (error) {
    console.error("Conversion error:", error);
    return c.json({ error: "Failed to convert SPD to SVG" }, 500);
  }
};

export const downloadHandler = async (c: any) => {
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
