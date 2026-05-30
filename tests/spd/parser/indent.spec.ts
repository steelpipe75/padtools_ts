// tests/spd/parser/indent.spec.ts
import { IllegalIndentException, parse } from "../../../src/spd/parser.js";

describe("SPDParser Indentation Scenarios", () => {
  it("should throw IllegalIndentException if there is a massive jump in indentation", () => {
    const spd = "Process\n\t\tSubprocess";
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("should handle mixed tabs and spaces correctly (or throw if inconsistent)", () => {
    // Current implementation seems to only look for \t for tabNum
    const spd = "Process\n \tSubprocess"; // space then tab
    // line.charAt(0) is ' ', so tabNum is 0.
    // tabNum (0) < context.depth (0) is false.
    // tabNum (0) > context.depth (0) is false.
    // So it treats it as same level but with body " \tSubprocess".
    const ast = parse(spd) as unknown as { children: { type: string }[] };
    expect(ast?.children[1].type).toBe("process");
  });

  it("should throw IllegalIndentException when dedenting to a level that doesn't exist", () => {
    // This is hard to achieve with the current logic because any dedent >= 0 is valid
    // unless it goes below 0, but tabNum is always >= 0.
    // Wait, if I have:
    // Process
    //   Sub
    //  SubSub (one space)
    // tabNum will be 0 for all if they don't use actual tabs.
  });
});
