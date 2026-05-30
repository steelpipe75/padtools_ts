import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import xmlFormat from "xml-formatter";
import { parse } from "../../../src/spd/parser.js";
import { render } from "../../../src/spd/svg-renderer.js";

let filename: string;
let dirname: string;

if (typeof __filename !== "undefined") {
  filename = __filename;
  dirname = __dirname;
} else {
  const metaUrl = new Function("return import.meta.url")();
  filename = fileURLToPath(metaUrl);
  dirname = path.dirname(filename);
}

const inputDir = path.join(dirname, "input");
const outputDir = path.join(dirname, "output");
const tempDir = path.join(dirname, "temp");

const testCases = fs
  .readdirSync(inputDir)
  .filter((file) => file.endsWith(".spd"));
const listRenderTypes = ["Original", "TerminalOffset"] as const;

describe("E2E tests", () => {
  listRenderTypes.forEach((listRenderType) => {
    describe(`listRenderType: ${listRenderType}`, () => {
      testCases.forEach((file) => {
        const inputPath = path.join(inputDir, file);
        const goldenPath = path.join(
          outputDir,
          listRenderType,
          file.replace(".spd", ".svg.txt"),
        );
        const outputPath = path.join(
          tempDir,
          listRenderType,
          file.replace(".spd", ".svg"),
        );

        test(`should correctly convert ${file}`, () => {
          const input = fs.readFileSync(inputPath, "utf-8");

          const ast = parse(input);
          const svgOutput = render(ast, { listRenderType: listRenderType });
          const outputData = xmlFormat(svgOutput);

          fs.writeFileSync(outputPath, outputData, "utf-8");

          const expected = fs.readFileSync(goldenPath, "utf-8");
          const actual = fs.readFileSync(outputPath, "utf-8");

          expect(actual).toBe(expected);
        });
      });
    });
  });
});
