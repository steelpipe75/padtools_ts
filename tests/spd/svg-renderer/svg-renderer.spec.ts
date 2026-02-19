import type {
  CallNode,
  CommentNode,
  IfNode,
  LoopNode,
  NodeListNode,
  ProcessNode,
  SwitchNode,
  TerminalNode,
} from "../../../src/spd/ast";
import { render } from "../../../src/spd/svg-renderer";

describe("SVG Renderer", () => {
  it("should render a ProcessNode correctly", () => {
    const node: ProcessNode = {
      type: "process",
      text: "処理ノード",
      childNode: null,
    };
    const svg = render(node);
    expect(svg).toContain("<rect");
    expect(svg).toContain("処理ノード");
  });

  it("should render a TerminalNode correctly", () => {
    const node: TerminalNode = {
      type: "terminal",
      text: "端子ノード",
    };
    const svg = render(node);
    expect(svg).toContain("<rect");
    expect(svg).toContain("rx");
    expect(svg).toContain("ry");
    expect(svg).toContain("端子ノード");
  });

  it("should render a NodeListNode correctly", () => {
    const node: NodeListNode = {
      type: "nodeList",
      children: [
        {
          type: "process",
          text: "処理1",
          childNode: null,
        },
        {
          type: "process",
          text: "処理2",
          childNode: null,
        },
      ],
    };
    const svg = render(node);
    expect(svg).toContain("処理1");
    expect(svg).toContain("処理2");
    expect(svg).toContain("<line"); // Check for connector lines
  });

  it("should render a CallNode correctly", () => {
    const node: CallNode = {
      type: "call",
      text: "呼び出しノード",
      childNode: null,
    };
    const svg = render(node);
    expect(svg).toContain("<rect");
    expect(svg.match(/<rect/g)?.length).toBe(2);
    expect(svg).toContain("呼び出しノード");
  });

  it("should render a LoopNode (while) correctly", () => {
    const node: LoopNode = {
      type: "loop",
      text: "ループ条件",
      isWhile: true,
      childNode: {
        type: "process",
        text: "ループ処理",
        childNode: null,
      },
    };
    const svg = render(node);
    expect(svg).toContain("ループ条件");
    expect(svg).toContain("ループ処理");
    expect(svg.match(/<line/g)?.length).toBeGreaterThanOrEqual(1); // Check for loop bars and connector
  });

  it("should render a LoopNode (do-while) correctly", () => {
    const node: LoopNode = {
      type: "loop",
      text: "ループ条件",
      isWhile: false,
      childNode: {
        type: "process",
        text: "ループ処理",
        childNode: null,
      },
    };
    const svg = render(node);
    expect(svg).toContain("ループ条件");
    expect(svg).toContain("ループ処理");
    expect(svg.match(/<line/g)?.length).toBeGreaterThanOrEqual(1); // Check for loop bars and connector
  });

  it("should render an IfNode correctly", () => {
    const node: IfNode = {
      type: "if",
      text: "条件",
      trueNode: {
        type: "process",
        text: "真の場合",
        childNode: null,
      },
      falseNode: {
        type: "process",
        text: "偽の場合",
        childNode: null,
      },
    };
    const svg = render(node);
    expect(svg).toContain("条件");
    expect(svg).toContain("真の場合");
    expect(svg).toContain("偽の場合");
    expect(svg.match(/<line/g)?.length).toBeGreaterThanOrEqual(2); // Check for connector lines
  });

  it("should render a SwitchNode correctly", () => {
    const node: SwitchNode = {
      type: "switch",
      text: "スイッチ条件",
      cases: new Map([
        ["Case1", { type: "process", text: "ケース1処理", childNode: null }],
        ["Case2", { type: "process", text: "ケース2処理", childNode: null }],
      ]),
    };
    const svg = render(node);
    expect(svg).toContain("スイッチ条件");
    expect(svg).toContain("Case1");
    expect(svg).toContain("ケース1処理");
    expect(svg).toContain("Case2");
    expect(svg).toContain("ケース2処理");
    expect(svg).toContain("<polygon"); // Check for polygon shape
    expect(svg.match(/<line/g)?.length).toBeGreaterThanOrEqual(2); // Check for connector lines
  });

  it("should render a CommentNode correctly", () => {
    const node: CommentNode = {
      type: "comment",
      text: "コメント",
    };
    const svg = render(node);
    expect(svg).toContain("<text");
    expect(svg).toContain("コメント");
  });

  it("should return an empty string for a null node", () => {
    const svg = render(null);
    expect(svg).toBe("");
  });

  it("should render with a base background color", () => {
    const node: ProcessNode = {
      type: "process",
      text: "test",
      childNode: null,
    };
    const svg = render(node, { baseBackgroundColor: "red" });
    expect(svg).toContain('<rect x="0" y="0"');
    expect(svg).toContain('fill="red"');
  });

  it("should render a transparent background rect for a null base background color", () => {
    const node: ProcessNode = {
      type: "process",
      text: "test",
      childNode: null,
    };
    const svg = render(node, { baseBackgroundColor: null });
    const widthMatch = svg.match(/width="([^"]+)"/);
    const heightMatch = svg.match(/height="([^"]+)"/);
    const svgWidth = widthMatch ? widthMatch[1] : "";
    const svgHeight = heightMatch ? heightMatch[1] : "";

    // Check for a rect that spans the entire SVG with a "none" fill
    const backgroundRectString = `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="none"`;
    expect(svg).toContain(backgroundRectString);
  });

  it("should handle unknown node types gracefully", () => {
    const node = {
      type: "unknown",
      text: "unknown",
      // biome-ignore lint/suspicious/noExplicitAny: Testing unknown node type
    } as any;
    const svg = render(node);
    // It should produce an SVG wrapper but the fragment inside will be empty
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("unknown"); // Text from the node should not be rendered
  });
});
