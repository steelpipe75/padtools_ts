import {
  handleConvertSpdToSvgTool,
  handleExplainSpdPrompt,
  handleGenerateSpdPrompt,
  handleGetSpdExplanationResource,
  handleGetSpdExplanationTool,
} from "../../src/mcp/handlers";
import { SPD_EXPLANATION } from "../../src/spd/docs";

describe("MCP Server Handlers", () => {
  describe("Resources", () => {
    it("handleGetSpdExplanationResource should return SPD explanation", async () => {
      const result = await handleGetSpdExplanationResource();
      expect(result.text).toBe(SPD_EXPLANATION);
      expect(result.mimeType).toBe("text/markdown");
    });
  });

  describe("Prompts", () => {
    it("handleExplainSpdPrompt should return a message containing SPD explanation", async () => {
      const result = await handleExplainSpdPrompt();
      expect(result).toContain("SPD (Simple PAD Description)");
      expect(result).toContain(SPD_EXPLANATION);
    });

    it("handleGenerateSpdPrompt should return a message containing the provided description", async () => {
      const description = "Test task description";
      const result = await handleGenerateSpdPrompt({ description });
      expect(result).toContain(description);
      expect(result).toContain(SPD_EXPLANATION);
    });

    it("handleGenerateSpdPrompt should throw error if description is missing", async () => {
      await expect(handleGenerateSpdPrompt({})).rejects.toThrow(
        "description is required",
      );
    });
  });

  describe("Tools", () => {
    it("handleGetSpdExplanationTool should return SPD explanation", async () => {
      const result = await handleGetSpdExplanationTool();
      expect(result).toBe(SPD_EXPLANATION);
    });

    it("handleConvertSpdToSvgTool should convert SPD to SVG", async () => {
      const spd = "Process: Test";
      const result = await handleConvertSpdToSvgTool({ spd });
      expect(typeof result).toBe("string");
      expect(result).toContain("<svg");
      expect(result).toContain("Test");
    });

    it("handleConvertSpdToSvgTool should throw error on parse error", async () => {
      const spd = ":if"; // 引数なしのコマンドはエラーになる
      await expect(handleConvertSpdToSvgTool({ spd })).rejects.toThrow(
        /SPD Parse Error/,
      );
    });

    it("handleConvertSpdToSvgTool should throw error on generic error", async () => {
      const core = require("../../src/spd/core");
      const originalGenerateSvg = core.generateSvg;
      core.generateSvg = jest.fn().mockImplementation(() => {
        throw new Error("Generic error");
      });

      try {
        const spd = "Process: Test";
        await expect(handleConvertSpdToSvgTool({ spd })).rejects.toThrow(
          "Error converting SPD to SVG: Generic error",
        );
      } finally {
        core.generateSvg = originalGenerateSvg;
      }
    });
  });
});
