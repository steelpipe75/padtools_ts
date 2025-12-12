// tests/spd/parser/indent.spec.ts
import { IllegalIndentException, parse } from "../../../src/spd/parser";

describe("SPDParser Indentation Scenarios", () => {
	it("should throw IllegalIndentException if the first line is indented", () => {
		const spd = "\tprocess";
		expect(() => parse(spd)).toThrow(IllegalIndentException);
	});
});
