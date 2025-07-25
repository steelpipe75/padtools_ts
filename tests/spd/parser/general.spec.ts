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
  UnknownCommandException,
} from "../../../src/spd/parser";

describe("SPDParser - General", () => {
  it("コメント行を無視すること", () => {
    const spd = `# This is a comment`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual(null);
  });

  it("シンプルなプロセスノードをパースすること", () => {
    const spd = `Hello World`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Hello World",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("複数のプロセスノードをパースすること", () => {
    const spd = `Process 1
Process 2`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "process", text: "Process 1", childNode: null },
        { type: "process", text: "Process 2", childNode: null },
      ],
    } as NodeListNode);
  });

  it("callコマンドをパースすること", () => {
    const spd = `:call MyFunction`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "call", text: "MyFunction", childNode: null },
      ],
    } as NodeListNode);
  });

  it("terminalコマンドをパースすること", () => {
    const spd = `:terminal Start
:terminal End`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "terminal", text: "Start" },
        { type: "terminal", text: "End" },
      ],
    } as NodeListNode);
  });

  it("callコマンドをパースすること", () => {
    const spd = `:call SubRoutine`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "call", text: "SubRoutine", childNode: null },
      ],
    } as NodeListNode);
  });

  it("commentコマンドをパースすること", () => {
    const spd = `:comment This is a comment`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "comment", text: "This is a comment" },
      ],
    } as NodeListNode);
  });

  it("@を含む複数行のテキストを処理すること", () => {
    const spd = `Multi-line text @
\t  continuation @
    final line`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Multi-line text \n  continuation \n    final line",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("コメント行を無視すること", () => {
    const spd = `# This is a comment
Process 1
  # Another comment
Process 2`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "process", text: "Process 1", childNode: null },
        { type: "process", text: "Process 2", childNode: null },
      ],
    } as NodeListNode);
  });

  it("空の入力に対してnullを返すこと", () => {
    const spd = ``;
    const ast = SPDParser.parse(spd);
    expect(ast).toBeNull();
  });

  it("空白文字だけの入力に対してnullを返すこと", () => {
    const spd = `
\t
\t\t
\t
  \t
    \t
`;
    const ast = SPDParser.parse(spd);
    expect(ast).toBeNull();
  });

  it("コメントのみの入力に対してnullを返すこと", () => {
    const spd = `# Comment 1
  # Comment 2`;
    const ast = SPDParser.parse(spd);
    expect(ast).toBeNull();
  });

  it("行内の@を処理すること", () => {
    const spd = `Process with@an at symbol`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Process with\nan at symbol",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("単一行プロセス内の@を改行に置換すること", () => {
    const spd = `Process@with@at`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Process\nwith\nat",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("ネストされた構造を正しく処理すること", () => {
    const spd = `:terminal Start
:comment This is a comment
:if condition1
\tProcess A
\t:while loopCondition A
\t\tProcess B
\t:switch switchCondition A
\t:case caseA1
\t\tProcess C
\t:case caseA2
\t\tProcess D
\t:call SubRoutine A
:else
\tProcess E
\t:dowhile loopCondition B
\t\tProcess F
\t:switch switchCondition B
\t:case caseB1
\t\tProcess G
\t:case caseB2
\t\tProcess H
\t:call SubRoutine B
:terminal End`;
    const ast = SPDParser.parse(spd);
    const expectedCasesA = new Map<string, Node | null>();
    expectedCasesA.set("caseA1", { type: "process", text: "Process C", childNode: null });
    expectedCasesA.set("caseA2", { type: "process", text: "Process D", childNode: null });
    const expectedCasesB = new Map<string, Node | null>();
    expectedCasesB.set("caseB1", { type: "process", text: "Process G", childNode: null });
    expectedCasesB.set("caseB2", { type: "process", text: "Process H", childNode: null });

    expect(ast).toEqual({
      type: "nodeList",
      children: [
        { type: "terminal", text: "Start" },
        { type: "comment", text: "This is a comment" },
        {
          type: "if",
          text: "condition1",
          trueNode: {
            type: "nodeList",
            children: [
              { type: "process", text: "Process A", childNode: null },
              {
                type: "loop",
                isWhile: true,
                text: "loopCondition A",
                childNode: { type: "process", text: "Process B", childNode: null },
              },
              {
                type: "switch",
                text: "switchCondition A",
                cases: expectedCasesA,
              },
              { type: "call", text: "SubRoutine A", childNode: null },
            ],
          },
          falseNode: {
            type: "nodeList",
            children: [
              { type: "process", text: "Process E", childNode: null },
              {
                type: "loop",
                isWhile: false,
                text: "loopCondition B",
                childNode: { type: "process", text: "Process F", childNode: null },
              },
              {
                type: "switch",
                text: "switchCondition B",
                cases: expectedCasesB,
              },
              { type: "call", text: "SubRoutine B", childNode: null },
            ],
          },
        },
        { type: "terminal", text: "End" },
      ],
    } as NodeListNode);
  });

  it("複数行テキスト内のコメントを処理すること", () => {
    const spd = `Multi-line text @
# this is a comment
final line`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Multi-line text \nfinal line",
          childNode: null,
        },
      ],
    } as NodeListNode);
  });

  it("シンプルなプロセスブロックからのインデント解除を処理すること", () => {
    const spd = `Process 1
\tProcess 2
\tProcess 3
Process 4
        `;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "Process 1",
          childNode: {
            type: "nodeList",
            children: [
              { type: "process", text: "Process 2", childNode: null },
              { type: "process", text: "Process 3", childNode: null },
            ],
          },
        },
        { type: "process", text: "Process 4", childNode: null },
      ],
    } as NodeListNode);
  });

  it("callのインデント解除を処理すること", () => {
    const spd = `:call SubRoutineA
\tProcess 1
\tProcess 2
:call SubRoutineB`;
    const ast = SPDParser.parse(spd);
    expect(ast).toEqual({
      type: "nodeList",
      children: [
        {
          type: "call",
          text: "SubRoutineA",
          childNode: {
            type: "nodeList",
            children: [
              { type: "process", text: "Process 1", childNode: null },
              { type: "process", text: "Process 2", childNode: null },
            ],
          },
        },
        { type: "call", text: "SubRoutineB", childNode: null },
      ],
    } as NodeListNode);
  });
});
