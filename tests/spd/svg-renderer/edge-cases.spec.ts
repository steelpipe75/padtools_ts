import type { NodeListNode } from "../../../src/spd/ast";
import { render } from "../../../src/spd/svg-renderer";

describe("SVG Renderer - Edge Cases", () => {
  const processAst: NodeListNode = {
    type: "nodeList",
    children: [{ type: "process", text: "test", childNode: null }],
  };

  it("should handle null or invalid strokeColor", () => {
    const svg = render(processAst, { strokeColor: null } as any);
    expect(svg).toContain('stroke="none"');
  });

  it("should handle string strokeWidth", () => {
    const svg = render(processAst, { strokeWidth: "2.5" } as any);
    expect(svg).toContain('stroke-width="2.5"');
  });

  it("should handle non-finite strokeWidth", () => {
    // Should fallback to default strokeWidth (1.0)
    const svg = render(processAst, { strokeWidth: Infinity } as any);
    expect(svg).toContain('stroke-width="1.0"');
  });

  it("should handle invalid strokeWidth (NaN)", () => {
    // Should fallback to default strokeWidth (1.0)
    const svg = render(processAst, { strokeWidth: NaN } as any);
    expect(svg).toContain('stroke-width="1.0"');
  });

  it("should handle negative strokeWidth", () => {
    // Should be clamped to 0.0
    const svg = render(processAst, { strokeWidth: -1 } as any);
    expect(svg).toContain('stroke-width="0.0"');
  });

  it("should handle various color formats in sanitizeSvgColor", () => {
    const testColors = [
      { input: "red", expected: "red" },
      { input: "#fff", expected: "#fff" },
      { input: "#ffffff", expected: "#ffffff" },
      { input: "rgb(255,255,255)", expected: "rgb(255,255,255)" },
      { input: "invalid-color", expected: "none" },
      { input: "  none  ", expected: "none" },
    ];

    for (const { input, expected } of testColors) {
      const svg = render(processAst, { strokeColor: input } as any);
      expect(svg).toContain(`stroke="${expected}"`);
    }
  });
});
