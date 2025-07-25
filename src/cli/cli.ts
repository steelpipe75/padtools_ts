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
  .action((options) => {
    try {
      let spdContent: string;
      if (options.input) {
        spdContent = fs.readFileSync(options.input, "utf-8");
      } else {
        spdContent = fs.readFileSync(0, "utf-8"); // Read from stdin
      }

      const ast = SPDParser.parse(spdContent);
      const svgOutput = render(ast);
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
