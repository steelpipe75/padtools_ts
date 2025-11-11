// tests/spd/parser/indent.spec.ts
import { SPDParser, IllegalIndentException } from "../../../src/spd/parser";

describe("SPDParser Indentation Scenarios", () => {
  it("should throw IllegalIndentException if the first line is indented", () => {
    const spd = "\tprocess";
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });
});
