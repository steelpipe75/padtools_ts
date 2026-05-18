import app from "../../src/api/app";
import type { Node } from "../../src/spd/ast";
import * as parser from "../../src/spd/parser";

describe("API AST Download Endpoints", () => {
  let sharedAst: Node;

  it("should download AST JSON successfully via /ast/parse/download", async () => {
    const spd = ":terminal Start\nProcess\n:terminal End";
    const res = await app.request("/ast/parse/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="diagram.json"',
    );

    const body = await res.json();
    expect(body.type).toBe("nodeList");
    sharedAst = body;
  });

  it("should download SVG successfully via /ast/render/download", async () => {
    const res = await app.request("/ast/render/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ast: sharedAst }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="diagram.svg"',
    );

    const body = await res.text();
    expect(body).toContain("<svg");
  });

  it("should return 400 if SPD is missing in /ast/parse/download", async () => {
    const res = await app.request("/ast/parse/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    // When using zod-openapi, missing required fields result in a ZodError response with status 400
  });

  it("should return 400 if AST is missing in /ast/render/download", async () => {
    const res = await app.request("/ast/render/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("should return 400 if parse fails in /ast/parse/download", async () => {
    const originalParse = parser.parse;
    (parser as unknown as { parse: jest.Mock }).parse = jest
      .fn()
      .mockReturnValue(null);

    try {
      const res = await app.request("/ast/parse/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spd: "test" }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Failed to parse SPD");
    } finally {
      (parser as unknown as { parse: typeof originalParse }).parse =
        originalParse;
    }
  });

  it("should render AST JSON with options via /ast/render/download", async () => {
    const res = await app.request("/ast/render/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ast: { type: "nodeList", children: [] },
        options: { fontSize: 20 },
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    const body = await res.text();
    expect(body).toContain("<svg");
  });
});
