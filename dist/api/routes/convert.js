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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadHandler = exports.convertHandler = exports.downloadRoute = exports.convertRoute = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const svgo_1 = require("svgo");
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const parser_1 = require("../../spd/parser");
const svg_renderer_1 = require("../../spd/svg-renderer");
const ConvertRequestOptionsSchema = zod_openapi_1.z.object({
    fontSize: zod_openapi_1.z
        .number()
        .optional()
        .openapi({ description: "Font size for the SVG", example: 14 }),
    fontFamily: zod_openapi_1.z.string().optional().openapi({
        description: "Font family for the SVG",
        example: "monospace",
    }),
    strokeWidth: zod_openapi_1.z
        .number()
        .optional()
        .openapi({ description: "Stroke width for the SVG", example: 1 }),
    strokeColor: zod_openapi_1.z.string().optional().openapi({
        description: "Stroke color for the SVG",
        example: "#000000",
    }),
    backgroundColor: zod_openapi_1.z.string().optional().openapi({
        description: "Background color for the SVG",
        example: "#ffffff",
    }),
    baseBackgroundColor: zod_openapi_1.z.string().optional().openapi({
        description: "Base background color for the SVG",
        example: "none",
    }),
    textColor: zod_openapi_1.z
        .string()
        .optional()
        .openapi({ description: "Text color for the SVG", example: "#000000" }),
    lineHeight: zod_openapi_1.z
        .number()
        .optional()
        .openapi({ description: "Line height for the SVG", example: 1.2 }),
    listRenderType: zod_openapi_1.z.enum(["Original", "TerminalOffset"]).optional().openapi({
        description: "List render type for the SVG",
        example: "TerminalOffset",
    }),
    prettyprint: zod_openapi_1.z.boolean().optional().openapi({
        description: "Whether to pretty print the SVG output",
        example: true,
    }),
});
const ConvertRequestSchema = zod_openapi_1.z.object({
    spd: zod_openapi_1.z.string().openapi({
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
    options: ConvertRequestOptionsSchema.optional(),
});
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
exports.downloadRoute = (0, zod_openapi_1.createRoute)({
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
const generateSvg = (spd, options = {}) => {
    const ast = (0, parser_1.parse)(spd);
    const renderOptions = {};
    // Map options to renderOptions
    if (options.fontSize !== undefined)
        renderOptions.fontSize = options.fontSize;
    if (options.fontFamily !== undefined)
        renderOptions.fontFamily = options.fontFamily;
    if (options.strokeWidth !== undefined)
        renderOptions.strokeWidth = options.strokeWidth;
    if (options.strokeColor !== undefined)
        renderOptions.strokeColor = options.strokeColor;
    if (options.backgroundColor !== undefined)
        renderOptions.backgroundColor = options.backgroundColor;
    if (options.baseBackgroundColor !== undefined)
        renderOptions.baseBackgroundColor = options.baseBackgroundColor;
    if (options.textColor !== undefined)
        renderOptions.textColor = options.textColor;
    if (options.lineHeight !== undefined)
        renderOptions.lineHeight = options.lineHeight;
    if (options.listRenderType !== undefined)
        renderOptions.listRenderType = options.listRenderType;
    const svgOutput = (0, svg_renderer_1.render)(ast, renderOptions);
    if (options.prettyprint) {
        return (0, xml_formatter_1.default)(svgOutput);
    }
    const optimizedSvg = (0, svgo_1.optimize)(svgOutput, {
        multipass: true,
    });
    return optimizedSvg.data;
};
const convertHandler = (c) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spd, options = {} } = c.req.valid("json");
        if (!spd) {
            return c.json({ error: "SPD content is required" }, 400);
        }
        const outputData = generateSvg(spd, options);
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
        const outputData = generateSvg(spd, options);
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
