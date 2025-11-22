#!/usr/bin/env node

import { program } from "commander";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
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

program
  .command("web")
  .description("Start a web server to serve the web application")
  .option("-p, --port <port>", "Port for the web server", (value) => parseInt(value, 10), 8080)
  .action((options) => {
    const isTsNode = !!(process as any)[Symbol.for("ts-node.register.instance")];
    const webPath = isTsNode ? path.join(__dirname, "..", "..", "web") : path.join(__dirname, "..", "web");
    const port = options.port;
    const command = `npx serve -s ${webPath} -l ${port}`;

    console.log(`Serving web application from: ${webPath}`);
    console.log(`Listening on http://localhost:${port}`);

    const child = child_process.exec(command);

    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });

program.parse(process.argv);
