import type { NodeListNode } from "../../../src/spd/ast";
import {
	NotRequireArgumentException,
	parse,
	RequireArgumentException,
	UnexpectedElseException,
} from "../../../src/spd/parser";

describe("SPDParser - If", () => {
	it("if文をパースすること", () => {
		const spd = `:if condition
\tTrue Branch`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: { type: "process", text: "True Branch", childNode: null },
					falseNode: null,
				},
			],
		} as NodeListNode);
	});

	it("複数の処理文をもつif文をパースすること", () => {
		const spd = `:if condition
\tTrue Branch1
\tTrue Branch2`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: {
						type: "nodeList",
						children: [
							{ type: "process", text: "True Branch1", childNode: null },
							{ type: "process", text: "True Branch2", childNode: null },
						],
					} as NodeListNode,
					falseNode: null,
				},
			],
		} as NodeListNode);
	});

	it("if-else文をパースすること", () => {
		const spd = `:if condition
\tTrue Branch
:else
\tFalse Branch`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: { type: "process", text: "True Branch", childNode: null },
					falseNode: { type: "process", text: "False Branch", childNode: null },
				},
			],
		} as NodeListNode);
	});

	it("else節に複数の処理があるif-else文をパースすること", () => {
		const spd = `:if condition
\tTrue Branch
:else
\tFalse Branch1
\tFalse Branch2`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: { type: "process", text: "True Branch", childNode: null },
					falseNode: {
						type: "nodeList",
						children: [
							{ type: "process", text: "False Branch1", childNode: null },
							{ type: "process", text: "False Branch2", childNode: null },
						],
					} as NodeListNode,
				},
			],
		} as NodeListNode);
	});

	it("if節が空のif-else文をパースすること", () => {
		const spd = `:if condition
:else
\tFalse Branch`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: null,
					falseNode: { type: "process", text: "False Branch", childNode: null },
				},
			],
		} as NodeListNode);
	});

	it("else節が空のif-else文をパースすること", () => {
		const spd = `:if condition
\tTrue Branch
:else
Process A`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: { type: "process", text: "True Branch", childNode: null },
					falseNode: null,
				},
				{ type: "process", text: "Process A", childNode: null },
			],
		} as NodeListNode);
	});

	it("空のif-elseブロックを処理すること", () => {
		const spd = `:if condition
:else
Process A`;
		const ast = parse(spd);
		expect(ast).toEqual({
			type: "nodeList",
			children: [
				{
					type: "if",
					text: "condition",
					trueNode: null,
					falseNode: null,
				},
				{
					type: "process",
					text: "Process A",
					childNode: null,
				},
			],
		} as NodeListNode);
	});

	it(":elseが:ifの後にない場合にUnexpectedElseExceptionをスローすること(Processの後)", () => {
		const spd = `Process
:else`;
		expect(() => parse(spd)).toThrow(UnexpectedElseException);
	});

	it(":elseが:ifの後にない場合にUnexpectedElseExceptionをスローすること(:switchの後)", () => {
		const spd = `:switch condition
:else`;
		expect(() => parse(spd)).toThrow(UnexpectedElseException);
	});

	it(":elseが:ifの後にない場合にUnexpectedElseExceptionをスローすること(:whileの後)", () => {
		const spd = `:while condition
:else`;
		expect(() => parse(spd)).toThrow(UnexpectedElseException);
	});

	it(":elseが:ifの後にない場合にUnexpectedElseExceptionをスローすること(:dowhileの後)", () => {
		const spd = `:dowhile condition
:else`;
		expect(() => parse(spd)).toThrow(UnexpectedElseException);
	});

	it(":elseが:ifの後にない場合にUnexpectedElseExceptionをスローすること(先頭行)", () => {
		const spd = `:else`;
		expect(() => parse(spd)).toThrow(UnexpectedElseException);
	});

	it("引数なしのifコマンドに対してRequireArgumentExceptionをスローすること", () => {
		const spd = `:if`;
		expect(() => parse(spd)).toThrow(RequireArgumentException);
	});

	it("引数付きのelseに対してNotRequireArgumentExceptionをスローすること", () => {
		const spd = `:if condition
\tTrue Branch
:else some_arg
\tFalse Branch`;
		expect(() => parse(spd)).toThrow(NotRequireArgumentException);
	});

	it("elseブロックが複数ある場合にUnexpectedElseExceptionをスローすること", () => {
		const spd = `:if condition
\tTrue Branch
:else
\tFalse Branch
:else
\tAnother False Branch`;
		expect(() => parse(spd)).toThrow(new UnexpectedElseException());
	});
});
