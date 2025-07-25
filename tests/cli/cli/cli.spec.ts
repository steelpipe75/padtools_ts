// test/cli/cli.spec.ts
import { Node } from "../../../src/spd/ast";

// Mock modules before any imports
jest.mock("fs");
jest.mock("../../../src/spd/parser");
jest.mock("../../../src/spd/svg-renderer");
jest.mock("svgo");
jest.mock("xml-formatter");

describe("CLI", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  let originalArgv: string[];

  beforeEach(() => {
    // Reset modules to re-run the CLI script for each test
    jest.resetModules();

    // Mock package.json
    jest.mock("../../../package.json", () => ({
      version: "1.0.0", // Mock the version to a fixed value
    }));

    // Spy on console methods and process.exit
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);

    // Backup original process.argv
    originalArgv = [...process.argv];
  });

  afterEach(() => {
    // Restore original implementations
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();

    // Restore original process.argv
    process.argv = originalArgv;
    jest.resetAllMocks();
  });

  const runCli = (args: string[]) => {
    process.argv = ["node", "cli.ts", ...args];
    require("../../../src/cli/cli");
  };

  it("should successfully convert an SPD file to SVG", () => {
    const inputPath = "input.spd";
    const outputPath = "output.svg";
    const spdContent = "dummy spd content";
    const ast: Node | null = { type: "process", text: "test", childNode: null };
    const svgOutput = "<svg/>";
    const optimizedSvg = { data: "<svg/>" };

    // Setup mocks
    const fs = require("fs");
    const { SPDParser } = require("../../../src/spd/parser");
    const { render } = require("../../../src/spd/svg-renderer");
    const { optimize } = require("svgo");
    const xmlFormat = require("xml-formatter");

    fs.readFileSync.mockReturnValue(spdContent);
    SPDParser.parse.mockReturnValue(ast);
    render.mockReturnValue(svgOutput);
    optimize.mockReturnValue(optimizedSvg);

    // Run CLI
    runCli(["-i", inputPath, "-o", outputPath]);

    // Assertions
    expect(fs.readFileSync).toHaveBeenCalledWith(inputPath, "utf-8");
    expect(SPDParser.parse).toHaveBeenCalledWith(spdContent);
    expect(render).toHaveBeenCalledWith(ast);
    expect(optimize).toHaveBeenCalledWith(svgOutput, expect.any(Object));
    expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, optimizedSvg.data);
    expect(xmlFormat).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should pretty print the output when --prettyprint option is provided", () => {
    const inputPath = "input.spd";
    const outputPath = "output.svg";
    const spdContent = "dummy spd content";
    const ast: Node | null = { type: "process", text: "test", childNode: null };
    const svgOutput = "<svg/>";
    const optimizedSvg = { data: "<svg/>" };
    const formattedSvg = "<svg>\n</svg>";

    // Setup mocks
    const fs = require("fs");
    const { SPDParser } = require("../../../src/spd/parser");
    const { render } = require("../../../src/spd/svg-renderer");
    const { optimize } = require("svgo");
    const xmlFormat = require("xml-formatter");

    fs.readFileSync.mockReturnValue(spdContent);
    SPDParser.parse.mockReturnValue(ast);
    render.mockReturnValue(svgOutput);
    optimize.mockReturnValue(optimizedSvg);
    xmlFormat.mockReturnValue(formattedSvg);

    // Run CLI
    runCli(["-i", inputPath, "-o", outputPath, "--prettyprint"]);

    // Assertions
    expect(xmlFormat).toHaveBeenCalledWith(optimizedSvg.data);
    expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, formattedSvg);
  });

  it("should pretty print the output when -p option is provided", () => {
    const inputPath = "input.spd";
    const outputPath = "output.svg";
    const spdContent = "dummy spd content";
    const ast: Node | null = { type: "process", text: "test", childNode: null };
    const svgOutput = "<svg/>";
    const optimizedSvg = { data: "<svg/>" };
    const formattedSvg = "<svg>\n</svg>";

    // Setup mocks
    const fs = require("fs");
    const { SPDParser } = require("../../../src/spd/parser");
    const { render } = require("../../../src/spd/svg-renderer");
    const { optimize } = require("svgo");
    const xmlFormat = require("xml-formatter");

    fs.readFileSync.mockReturnValue(spdContent);
    SPDParser.parse.mockReturnValue(ast);
    render.mockReturnValue(svgOutput);
    optimize.mockReturnValue(optimizedSvg);
    xmlFormat.mockReturnValue(formattedSvg);

    // Run CLI
    runCli(["-i", inputPath, "-o", outputPath, "-p"]);

    // Assertions
    expect(xmlFormat).toHaveBeenCalledWith(optimizedSvg.data);
    expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, formattedSvg);
  });

  it("should handle errors during file reading", () => {
    const inputPath = "input.spd";
    const outputPath = "output.svg";
    const errorMessage = "File not found";

    // Setup mocks
    const fs = require("fs");
    fs.readFileSync.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    // Run CLI
    runCli(["-i", inputPath, "-o", outputPath]);

    // Assertions
    expect(fs.readFileSync).toHaveBeenCalledWith(inputPath, "utf-8");
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
