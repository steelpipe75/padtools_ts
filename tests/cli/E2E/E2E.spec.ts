import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const inputDir = path.join(__dirname, "input");
const outputDir = path.join(__dirname, "output");
const minifiedOutputDir = path.join(__dirname, "output_minified");
const tempDir = path.join(__dirname, "temp");

const testCases = fs.readdirSync(inputDir).filter(file => file.endsWith(".spd"));

describe("CLI E2E tests", () => {
  // Success cases
  describe("for success cases", () => {
    testCases.forEach(file => {
      const inputPath = path.join(inputDir, file);

      describe(`for file ${file}`, () => {
        const cases = [
          { option: "--prettyprint", isPretty: true, name: "with --prettyprint option" },
          { option: "-p", isPretty: true, name: "with -p option" },
          { option: "", isPretty: false, name: "without prettyprint option" },
        ];

        test.each(cases)("should correctly convert $name and exit with 0", ({ option, isPretty, name }) => {
          const outputPath = path.join(tempDir, file.replace(".spd", `_${name.replace(/ /g, "_")}.svg`));

          // The command should execute successfully (exit code 0).
          // execSync will throw an error for non-zero exit codes.
          expect(() => {
            execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} ${option}`);
          }).not.toThrow();

          const actual = fs.readFileSync(outputPath, "utf-8");

          const goldenFileDir = isPretty ? outputDir : minifiedOutputDir;
          const goldenPath = path.join(goldenFileDir, file.replace(".spd", ".svg.txt"));
          const expected = fs.readFileSync(goldenPath, "utf-8");

          expect(actual).toBe(expected);
        });
      });
    });

    it("should correctly apply --font-size option", () => {
      const file = "sample_input.spd";
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(tempDir, file.replace(".spd", "_font_size_20.svg"));
      const goldenPath = path.join(outputDir, file.replace(".spd", "_font_size_20.svg.txt"));

      expect(() => {
        execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} --font-size 20`);
      }).not.toThrow();

      const actual = fs.readFileSync(outputPath, "utf-8");
      const expected = fs.readFileSync(goldenPath, "utf-8");

      expect(actual).toBe(expected);
    });

    it("should correctly apply --base-background-color gray option", () => {
      const file = "sample_input.spd";
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(tempDir, file.replace(".spd", "_base_background_color_gray.svg"));
      const goldenPath = path.join(outputDir, file.replace(".spd", "_base_background_color_gray.svg.txt"));

      expect(() => {
        execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} --base-background-color #888`);
      }).not.toThrow();

      const actual = fs.readFileSync(outputPath, "utf-8");
      const expected = fs.readFileSync(goldenPath, "utf-8");

      expect(actual).toBe(expected);
    });

    it("should correctly apply --base-background-color black option", () => {
      const file = "sample_input.spd";
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(tempDir, file.replace(".spd", "_base_background_color_black.svg"));
      const goldenPath = path.join(outputDir, file.replace(".spd", "_base_background_color_black.svg.txt"));

      expect(() => {
        execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} --base-background-color #000`);
      }).not.toThrow();

      const actual = fs.readFileSync(outputPath, "utf-8");
      const expected = fs.readFileSync(goldenPath, "utf-8");

      expect(actual).toBe(expected);
    });

    it("should correctly apply --base-background-color white option", () => {
      const file = "sample_input.spd";
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(tempDir, file.replace(".spd", "_base_background_color_white.svg"));
      const goldenPath = path.join(outputDir, file.replace(".spd", "_base_background_color_white.svg.txt"));

      expect(() => {
        execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} --base-background-color #FFF`);
      }).not.toThrow();

      const actual = fs.readFileSync(outputPath, "utf-8");
      const expected = fs.readFileSync(goldenPath, "utf-8");

      expect(actual).toBe(expected);
    });

    it("should correctly apply --base-background-color none option", () => {
      const file = "sample_input.spd";
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(tempDir, file.replace(".spd", "_base_background_color_none.svg"));
      const goldenPath = path.join(outputDir, file.replace(".spd", "_base_background_color_none.svg.txt"));

      expect(() => {
        execSync(`npx ts-node src/cli/cli.ts -i ${inputPath} -o ${outputPath} --base-background-color ""`);
      }).not.toThrow();

      const actual = fs.readFileSync(outputPath, "utf-8");
      const expected = fs.readFileSync(goldenPath, "utf-8");

      expect(actual).toBe(expected);
    });
  });

  // Failure cases
  describe("for failure cases", () => {
    it("should exit with 1 when input file does not exist", () => {
      const nonExistentInputPath = "non_existent_file.spd";
      const outputPath = path.join(tempDir, "output.svg");
      const command = `npx ts-node src/cli/cli.ts -i ${nonExistentInputPath} -o ${outputPath}`;

      try {
        execSync(command);
        // If execSync does not throw, the test should fail.
        fail("The command should have failed but it completed successfully.");
      } catch (error: any) {
        // Check if the process exited with status code 1
        expect(error.status).toBe(1);
      }
    });
  });

  // Stdin/Stdout cases
  describe("for stdin/stdout cases", () => {
    const sampleInputFile = "sample_input.spd";
    const sampleInputPath = path.join(inputDir, sampleInputFile);
    const sampleOutputFile = sampleInputFile.replace(".spd", ".svg.txt");

    it("should correctly convert from stdin to stdout with --prettyprint option", () => {
      const command = `npx ts-node src/cli/cli.ts --prettyprint < ${sampleInputPath}`;
      const actual = execSync(command, { encoding: "utf-8" });
      const expected = fs.readFileSync(path.join(outputDir, sampleOutputFile), "utf-8");
      expect(actual).toBe(expected);
    });

    it("should correctly convert from stdin to stdout with -p option", () => {
      const command = `npx ts-node src/cli/cli.ts -p < ${sampleInputPath}`;
      const actual = execSync(command, { encoding: "utf-8" });
      const expected = fs.readFileSync(path.join(outputDir, sampleOutputFile), "utf-8");
      expect(actual).toBe(expected);
    });

    it("should correctly convert from stdin to stdout without prettyprint option", () => {
      const command = `npx ts-node src/cli/cli.ts < ${sampleInputPath}`;
      const actual = execSync(command, { encoding: "utf-8" });
      const expected = fs.readFileSync(path.join(minifiedOutputDir, sampleOutputFile), "utf-8");
      expect(actual).toBe(expected);
    });
  });

  // Demo
  describe("Demo", () => {
    const sampleInputFile = "sample_input.spd";
    const sampleOutputPath = "sample_output.svg";
    const sampleOutputFile = sampleInputFile.replace(".spd", ".svg.txt");

    it("Redirect standard output to update the sample output file in the project root while comparing it with the GoldenFile.", () => {
      const command = `npx ts-node src/cli/cli.ts < ${sampleInputFile} > ${sampleOutputPath}`;
      execSync(command, { encoding: "utf-8" });
      const actual = fs.readFileSync(sampleOutputPath, "utf-8");
      const expected = fs.readFileSync(path.join(minifiedOutputDir, sampleOutputFile), "utf-8");
      expect(actual).toBe(expected);
    });
  });
});