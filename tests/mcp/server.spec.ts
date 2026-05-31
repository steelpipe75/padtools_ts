import { jest } from "@jest/globals";
import {
  handleConvertAstToSvgTool,
  handleConvertSpdToAstTool,
  handleConvertSpdToSvgTool,
  handleExplainSpdPrompt,
  handleGenerateSpdPrompt,
  handleGetSpdExplanationResource,
  handleGetSpdExplanationTool,
} from "../../src/mcp/handlers.js";
import * as core from "../../src/spd/core.js";
import { SPD_EXPLANATION } from "../../src/spd/docs.js";

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
      const generateSvgSpy = jest
        .spyOn(core.core, "generateSvg")
        .mockImplementation(() => {
          throw new Error("Generic error");
        });

      try {
        const spd = "Process: Test";
        await expect(handleConvertSpdToSvgTool({ spd })).rejects.toThrow(
          "Error converting SPD to SVG: Generic error",
        );
      } finally {
        generateSvgSpy.mockRestore();
      }
    });

    it("handleConvertSpdToAstTool should convert SPD to AST", async () => {
      const spd = ":terminal Start\nProcess\n:terminal End";
      const result = await handleConvertSpdToAstTool({ spd });
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("type", "nodeList");
      expect(result).toHaveProperty("children");
    });

    it("handleConvertSpdToAstTool should throw error on parse error", async () => {
      const spd = ":if";
      await expect(handleConvertSpdToAstTool({ spd })).rejects.toThrow(
        /SPD Parse Error/,
      );
    });

    it("handleConvertAstToSvgTool should convert AST to SVG", async () => {
      const spd = ":terminal Start\nProcess\n:terminal End";
      const ast = await handleConvertSpdToAstTool({ spd });
      const result = await handleConvertAstToSvgTool({ ast });
      expect(typeof result).toBe("string");
      expect(result).toContain("<svg");
      expect(result).toContain("Start");
      expect(result).toContain("Process");
      expect(result).toContain("End");
    });

    it("handleConvertAstToSvgTool should throw error on null AST", async () => {
      await expect(
        handleConvertAstToSvgTool({ ast: null as unknown as any }),
      ).rejects.toThrow(/Error converting AST to SVG/);
    });
  });
});
