"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const svgo_1 = require("svgo");
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const parser_1 = require("../../spd/parser");
const svg_renderer_1 = require("../../spd/svg-renderer");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/convert:
 *   post:
 *     summary: Convert SPD text to SVG
 *     description: Converts Simple PAD Description (SPD) text to SVG image with optional rendering options.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spd:
 *                 type: string
 *                 description: The SPD text to convert
 *                 example: "process: Start\nterminal: End"
 *               options:
 *                 type: object
 *                 properties:
 *                   fontSize:
 *                     type: number
 *                     description: Font size for the SVG
 *                   fontFamily:
 *                     type: string
 *                     description: Font family for the SVG
 *                   strokeWidth:
 *                     type: number
 *                     description: Stroke width for the SVG
 *                   strokeColor:
 *                     type: string
 *                     description: Stroke color for the SVG
 *                   backgroundColor:
 *                     type: string
 *                     description: Background color for the SVG
 *                   baseBackgroundColor:
 *                     type: string
 *                     description: Base background color for the SVG
 *                   textColor:
 *                     type: string
 *                     description: Text color for the SVG
 *                   lineHeight:
 *                     type: number
 *                     description: Line height for the SVG
 *                   listRenderType:
 *                     type: string
 *                     enum: [original, TerminalOffset]
 *                     description: List render type for the SVG
 *                   prettyprint:
 *                     type: boolean
 *                     description: Whether to pretty print the SVG output
 *             required:
 *               - spd
 *     responses:
 *       200:
 *         description: Successful conversion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 svg:
 *                   type: string
 *                   description: The generated SVG content
 *       400:
 *         description: Bad request - invalid SPD or options
 *       500:
 *         description: Internal server error
 */
router.post("/convert", (req, res) => {
    try {
        const { spd, options = {} } = req.body;
        if (!spd || typeof spd !== "string") {
            return res
                .status(400)
                .json({ error: "SPD content is required and must be a string" });
        }
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
        const optimizedSvg = (0, svgo_1.optimize)(svgOutput, {
            multipass: true,
        });
        let outputData = optimizedSvg.data;
        if (options.prettyprint) {
            outputData = (0, xml_formatter_1.default)(svgOutput);
        }
        res.json({ svg: outputData });
    }
    catch (error) {
        console.error("Conversion error:", error);
        res.status(500).json({ error: "Failed to convert SPD to SVG" });
    }
});
exports.default = router;
