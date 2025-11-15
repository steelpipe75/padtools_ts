#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
import { optimize } from "svgo";
import xmlFormat from "xml-formatter";
import { SPDParser } from "../spd/parser";
import { render } from "../spd/svg-renderer";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require("../../package.json");

program
  .version(packageJson.version)
  .description("Convert SPD(Simple PAD Description) text file to SVG image")
  .option("-i, --input <inputFilePath>", "Path to the input SPD text file")
  .option("-o, --output <outputFilePath>", "Path to the output SVG file")
  .option("-p, --prettyprint", "Pretty print the output SVG")
  .option("--font-size <fontSize>", "Font size for the SVG", parseFloat)
  .option("--font-family <fontFamily>", "Font family for the SVG")
  .option("--stroke-width <strokeWidth>", "Stroke width for the SVG", parseFloat)
  .option("--stroke-color <strokeColor>", "Stroke color for the SVG")
  .option("--background-color <backgroundColor>", "Background color for the SVG")
  .option("--base-background-color <baseBackgroundColor>", "Base background color for the SVG")
  .option("--text-color <textColor>", "Text color for the SVG")
  .option("--line-height <lineHeight>", "Line height for the SVG", parseFloat)
  .option("--list-render-type <listRenderType>", "List render type for the SVG (original, TerminalOffset)", "original")
  .action((options) => {
    try {
      let spdContent: string;
      if (options.input) {
        spdContent = fs.readFileSync(options.input, "utf-8");
      } else {
        spdContent = fs.readFileSync(0, "utf-8"); // Read from stdin
      }

      const ast = SPDParser.parse(spdContent);
      const renderOptions: Parameters<typeof render>[1] = {};
      if (options.fontSize !== undefined) renderOptions.fontSize = options.fontSize;
      if (options.fontFamily !== undefined) renderOptions.fontFamily = options.fontFamily;
      if (options.strokeWidth !== undefined) renderOptions.strokeWidth = options.strokeWidth;
      if (options.strokeColor !== undefined) renderOptions.strokeColor = options.strokeColor;
      if (options.backgroundColor !== undefined) renderOptions.backgroundColor = options.backgroundColor;
      if (options.baseBackgroundColor !== undefined) renderOptions.baseBackgroundColor = options.baseBackgroundColor;
      if (options.textColor !== undefined) renderOptions.textColor = options.textColor;
      if (options.lineHeight !== undefined) renderOptions.lineHeight = options.lineHeight;
      if (options.listRenderType !== undefined) renderOptions.listRenderType = options.listRenderType;

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
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
