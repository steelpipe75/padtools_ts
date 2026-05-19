#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const commander_1 = require("commander");
const svgo_1 = require("svgo");
const xml_formatter_1 = __importDefault(require("xml-formatter"));
const package_json_1 = __importDefault(require("../../package.json"));
const ast_1 = require("../spd/ast");
const parser_1 = require("../spd/parser");
const svg_renderer_1 = require("../spd/svg-renderer");
commander_1.program
    .version(package_json_1.default.version)
    .description("Convert SPD(Simple PAD Description) text file to SVG image")
    .option("-i, --input <inputFilePath>", "Path to the input file (SPD or AST JSON)")
    .option("-o, --output <outputFilePath>", "Path to the output SVG file")
    .option("-p, --prettyprint", "Pretty print the output SVG or AST JSON")
    .option("--export-ast <astFilePath>", "Path to export the parsed AST as JSON")
    .option("--import-ast", "Treat input as an AST JSON file")
    .option("--font-size <fontSize>", "Font size for the SVG", parseFloat)
    .option("--font-family <fontFamily>", "Font family for the SVG")
    .option("--stroke-width <strokeWidth>", "Stroke width for the SVG", parseFloat)
    .option("--stroke-color <strokeColor>", "Stroke color for the SVG")
    .option("--background-color <backgroundColor>", "Background color for the SVG")
    .option("--base-background-color <baseBackgroundColor>", "Base background color for the SVG")
    .option("--text-color <textColor>", "Text color for the SVG")
    .option("--line-height <lineHeight>", "Line height for the SVG", parseFloat)
    .option("--list-render-type <listRenderType>", "List render type for the SVG (Original, TerminalOffset)")
    .action((options) => {
    try {
        let inputContent;
        if (options.input) {
            inputContent = fs.readFileSync(options.input, "utf-8");
        }
        else if (process.stdin.isTTY && !options.input) {
            // No input provided and no stdin redirect
            commander_1.program.help();
            return;
        }
        else {
            inputContent = fs.readFileSync(0, "utf-8"); // Read from stdin
        }
        let ast;
        if (options.importAst) {
            ast = (0, ast_1.deserializeAST)(inputContent);
        }
        else {
            ast = (0, parser_1.parse)(inputContent);
        }
        if (!ast) {
            console.error("Error: Could not obtain AST.");
            process.exit(1);
        }
        if (options.exportAst) {
            const astJson = (0, ast_1.serializeAST)(ast, options.prettyprint ? 2 : undefined);
            fs.writeFileSync(options.exportAst, astJson);
        }
        const renderOptions = {};
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
            // optional but recommended
            path: options.output || "output.svg", // Provide a dummy path for svgo if no output file
            // all config fields are also available here
            multipass: true,
        });
        let outputData = optimizedSvg.data;
        if (options.prettyprint) {
            outputData = (0, xml_formatter_1.default)(svgOutput);
        }
        if (options.output) {
            fs.writeFileSync(options.output, outputData);
        }
        else {
            process.stdout.write(outputData);
        }
    }
    catch (error) {
        if (error instanceof parser_1.ParseError) {
            if (error.lineNo !== undefined && error.lineStr !== undefined) {
                console.error(`Error at line ${error.lineNo}: ${error.message}`);
                console.error(`> ${error.lineStr}`);
            }
            else {
                console.error(`Error: ${error.message}`);
            }
        }
        else if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
});
commander_1.program.parse(process.argv);
