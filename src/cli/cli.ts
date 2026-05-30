#!/usr/bin/env node

import { getRequire } from "../utils/compat.js";
const cjsRequire = getRequire();
const xmlFormat = cjsRequire("xml-formatter");
import * as fs from "node:fs";
import { program } from "commander";
import { optimize } from "svgo";
const packageJson = cjsRequire("../../package.json");
import { deserializeAST, serializeAST } from "../spd/ast.js";
import { ParseError, parse } from "../spd/parser.js";
import { render } from "../spd/svg-renderer.js";

program
  .version(packageJson.version)
  .description("Convert SPD(Simple PAD Description) text file to SVG image")
  .option(
    "-i, --input <inputFilePath>",
    "Path to the input file (SPD or AST JSON)",
  )
  .option("-o, --output <outputFilePath>", "Path to the output SVG file")
  .option("-p, --prettyprint", "Pretty print the output SVG or AST JSON")
  .option("--export-ast <astFilePath>", "Path to export the parsed AST as JSON")
  .option("--import-ast", "Treat input as an AST JSON file")
  .option("--font-size <fontSize>", "Font size for the SVG", parseFloat)
  .option("--font-family <fontFamily>", "Font family for the SVG")
  .option(
    "--stroke-width <strokeWidth>",
    "Stroke width for the SVG",
    parseFloat,
  )
  .option("--stroke-color <strokeColor>", "Stroke color for the SVG")
  .option(
    "--background-color <backgroundColor>",
    "Background color for the SVG",
  )
  .option(
    "--base-background-color <baseBackgroundColor>",
    "Base background color for the SVG",
  )
  .option("--text-color <textColor>", "Text color for the SVG")
  .option("--line-height <lineHeight>", "Line height for the SVG", parseFloat)
  .option(
    "--list-render-type <listRenderType>",
    "List render type for the SVG (Original, TerminalOffset)",
  )
  .action((options) => {
    try {
      let inputContent: string;
      if (options.input) {
        inputContent = fs.readFileSync(options.input, "utf-8");
      } else if (process.stdin.isTTY && !options.input) {
        // No input provided and no stdin redirect
        program.help();
        return;
      } else {
        inputContent = fs.readFileSync(0, "utf-8"); // Read from stdin
      }

      let ast: ReturnType<typeof parse>;

      if (options.importAst) {
        ast = deserializeAST(inputContent);
      } else {
        ast = parse(inputContent);
      }

      if (!ast) {
        console.error("Error: Could not obtain AST.");
        process.exit(1);
      }

      if (options.exportAst) {
        const astJson = serializeAST(ast, options.prettyprint ? 2 : undefined);
        fs.writeFileSync(options.exportAst, astJson);
      }

      const renderOptions: Parameters<typeof render>[1] = {};
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

      const svgOutput = render(ast, renderOptions);
      const optimizedSvg = optimize(svgOutput, {
        // optional but recommended
        path: options.output || "output.svg", // Provide a dummy path for svgo if no output file
        // all config fields are also available here
        multipass: true,
      });
      let outputData = optimizedSvg.data;
      if (options.prettyprint) {
        outputData = xmlFormat(svgOutput);
      }

      if (options.output) {
        fs.writeFileSync(options.output, outputData);
      } else {
        process.stdout.write(outputData);
      }
    } catch (error) {
      if (error instanceof ParseError) {
        if (error.lineNo !== undefined && error.lineStr !== undefined) {
          console.error(`Error at line ${error.lineNo}: ${error.message}`);
          console.error(`> ${error.lineStr}`);
        } else {
          console.error(`Error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
