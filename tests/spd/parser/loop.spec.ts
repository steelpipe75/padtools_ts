import {
  CallNode,
  CommentNode,
  IfNode,
  LoopNode,
  Node,
  NodeListNode,
  ProcessNode,
  SwitchNode,
  TerminalNode,
} from "../../../src/spd/ast";
import {
  CaseDuplicateException,
  IllegalIndentException,
  NotRequireArgumentException,
  RequireArgumentException,
  SPDParser,
  UnexpectedCaseException,
  UnexpectedElseException,
} from "../../../src/spd/parser";

describe("SPDParser - Loop", () => {
  it("処理が空のwhileループをパースすること", () => {
    const spd = `:while condition`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: true,
          text: "condition",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("処理が空のdo-whileループをパースすること", () => {
    const spd = `:dowhile condition`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: false,
          text: "condition",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("whileループをパースすること", () => {
    const spd = `:while condition
\tProcess A`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: true,
          text: "condition",
          childNode: {
            type: "process",
            text: "Process A",
            childNode: null,
          },
        },
      ],
    } as NodeListNode);
  });

  it("do-whileループをパースすること", () => {
    const spd = `:dowhile condition
\tProcess A`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: false,
          text: "condition",
          childNode: {
            type: "process",
            text: "Process A",
            childNode: null,
          },
        },
      ],
    } as NodeListNode);
  });

  it("複数の処理をもつwhileループをパースすること", () => {
    const spd = `:while condition
\tProcess A
\tProcess B`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: true,
          text: "condition",
          childNode: {
            type: "nodeList",
            children: [
              {
                type: "process",
                text: "Process A",
                childNode: null,
              },
              {
                type: "process",
                text: "Process B",
                childNode: null,
              },
            ],
          },
        },
      ],
    } as NodeListNode);
  });

  it("複数の処理をもつdo-whileループをパースすること", () => {
    const spd = `:dowhile condition
\tProcess A
\tProcess B`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "loop",
          isWhile: false,
          text: "condition",
          childNode: {
            type: "nodeList",
            children: [
              {
                type: "process",
                text: "Process A",
                childNode: null,
              },
              {
                type: "process",
                text: "Process B",
                childNode: null,
              },
            ],
          },
        },
      ],
    } as NodeListNode);
  });

  it("引数なしのwhileコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:while`;
    expect(() => SPDParser.parse(spd)).toThrow(RequireArgumentException);
  });

  it("引数なしのdowhileコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:dowhile`;
    expect(() => SPDParser.parse(spd)).toThrow(RequireArgumentException);
  });
});
