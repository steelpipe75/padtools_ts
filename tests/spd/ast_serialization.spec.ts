import { serializeAST, deserializeAST, NodeListNode, SwitchNode } from "../../src/spd/ast";

describe("AST Serialization/Deserialization", () => {
  it("should serialize and deserialize a simple AST", () => {
    const ast: NodeListNode = {
      type: "nodeList",
      children: [
        { type: "terminal", text: "Start" },
        { type: "process", text: "Process 1", childNode: null },
        { type: "terminal", text: "End" }
      ]
    };

    const json = serializeAST(ast);
    const recovered = deserializeAST(json);
    expect(recovered).toEqual(ast);
  });

  it("should correctly handle SwitchNode with Map", () => {
    const switchNode: SwitchNode = {
      type: "switch",
      text: "Condition",
      cases: new Map([
        ["Case 1", { type: "process", text: "Action 1", childNode: null }],
        ["Case 2", null]
      ])
    };
    const ast: NodeListNode = {
      type: "nodeList",
      children: [switchNode]
    };

    const json = serializeAST(ast);
    const recovered = deserializeAST(json) as NodeListNode;
    
    expect(recovered.type).toBe("nodeList");
    const recoveredSwitch = recovered.children[0] as SwitchNode;
    expect(recoveredSwitch.type).toBe("switch");
    expect(recoveredSwitch.cases instanceof Map).toBe(true);
    expect(recoveredSwitch.cases.get("Case 1")).toEqual(switchNode.cases.get("Case 1"));
    expect(recoveredSwitch.cases.get("Case 2")).toBeNull();
    expect(recoveredSwitch.cases.size).toBe(2);
  });

  it("should handle null AST", () => {
    expect(serializeAST(null)).toBe("null");
    expect(deserializeAST("null")).toBeNull();
  });
});
