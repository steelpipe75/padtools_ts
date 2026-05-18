import { generateSvgFromAst } from "../../src/spd/core";

describe("SPD Edge Cases", () => {
  it("should throw error if AST is null in generateSvgFromAst", () => {
    expect(() => generateSvgFromAst(null as never)).toThrow(
      "AST is null or undefined",
    );
  });
});
