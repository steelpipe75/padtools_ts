import { generateSvgFromAst } from "../../src/spd/core";

describe("SPD Edge Cases", () => {
  it("should throw error if AST is null in generateSvgFromAst", () => {
    expect(() => generateSvgFromAst(null as any)).toThrow("AST is null or undefined");
  });
});
