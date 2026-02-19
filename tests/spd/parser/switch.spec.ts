import type { Node, NodeListNode } from "../../../src/spd/ast";
import {
  CaseDuplicateException,
  IllegalIndentException,
  parse,
  RequireArgumentException,
  UnexpectedCaseException,
} from "../../../src/spd/parser";

describe("SPDParser - Switch", () => {
  it("ケースを持つswitch文をパースすること", () => {
    const spd = `:switch value
:case A
\tCase A Body
:case B
\tCase B Body`;
    const ast = parse(spd);
    const expectedCases = new Map<string, Node | null>();
    expectedCases.set("A", {
      type: "process",
      text: "Case A Body",
      childNode: null,
    });
    expectedCases.set("B", {
      type: "process",
      text: "Case B Body",
      childNode: null,
    });

    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "switch",
          text: "value",
          cases: expectedCases,
        },
      ],
    } as NodeListNode);
  });

  it("ケースを持たないswitch文をパースすること", () => {
    const spd = `:switch value`;
    const ast = parse(spd);
    const expectedCases = new Map<string, Node | null>();

    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "switch",
          text: "value",
          cases: expectedCases,
        },
      ],
    } as NodeListNode);
  });

  it("空のケースを持つswitch文をパースすること", () => {
    const spd = `:switch value
:case A
:case B`;
    const ast = parse(spd);
    const expectedCases = new Map<string, Node | null>();
    expectedCases.set("A", null);
    expectedCases.set("B", null);

    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "switch",
          text: "value",
          cases: expectedCases,
        },
      ],
    } as NodeListNode);
  });

  it(":caseが:switchの後にない場合にUnexpectedCaseExceptionをスローすること", () => {
    const spd = `Process
:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it("重複するケース値に対してCaseDuplicateExceptionをスローすること", () => {
    const spd = `:switch value
:case A
\tBody A
:case A
\tBody A2`;
    expect(() => parse(spd)).toThrow(CaseDuplicateException);
  });

  it("引数なしのswitchに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:switch`;
    expect(() => parse(spd)).toThrow(RequireArgumentException);
  });

  it(":caseが:switchの下にない場合にUnexpectedCaseExceptionをスローすること（Processの後）", () => {
    const spd = `Process A
:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it(":caseが:switchの下にない場合にUnexpectedCaseExceptionをスローすること（:ifの後）", () => {
    const spd = `:if condition
:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it(":caseが:switchの下にない場合にUnexpectedCaseExceptionをスローすること（:whileの後）", () => {
    const spd = `:while condition
:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it(":caseが:switchの下にない場合にUnexpectedCaseExceptionをスローすること（:dowhileの後）", () => {
    const spd = `:dowhile condition
:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it(":caseが:switchの下にない場合にUnexpectedCaseExceptionをスローすること（先頭行）", () => {
    const spd = `:case A`;
    expect(() => parse(spd)).toThrow(UnexpectedCaseException);
  });

  it(":caseに引数がない場合RequireArgumentExceptionをスローすること", () => {
    const spd = `:switch value
:case`;
    expect(() => parse(spd)).toThrow(RequireArgumentException);
  });

  it(":switchの下に子要素を指定するとIllegalIndentExceptionをスローすること", () => {
    const spd = `:switch value
\tProcess A`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });
});
