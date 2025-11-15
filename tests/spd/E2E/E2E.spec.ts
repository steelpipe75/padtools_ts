import * as fs from "fs";
import * as path from "path";
import xmlFormat from "xml-formatter";
import { SPDParser } from "../../../src/spd/parser";
import { render } from "../../../src/spd/svg-renderer";

const inputDir = path.join(__dirname, "input");
const outputDir = path.join(__dirname, "output");
const tempDir = path.join(__dirname, "temp");

const testCases = fs.readdirSync(inputDir).filter(file => file.endsWith(".spd"));
const listRenderTypes = ["original", "TerminalOffset"] as const;

describe("E2E tests", () => {
  listRenderTypes.forEach(listRenderType => {
    describe(`listRenderType: ${listRenderType}`, () => {
      testCases.forEach(file => {
        const inputPath = path.join(inputDir, file);
        const goldenPath = path.join(
          outputDir,
          listRenderType,
          file.replace(".spd", ".svg.txt"),
        );
        const outputPath = path.join(tempDir, file.replace(".spd", ".svg"));

        test(`should correctly convert ${file}`, () => {
          const input = fs.readFileSync(inputPath, "utf-8");

          const ast = SPDParser.parse(input);
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
