import { jest } from "@jest/globals";
import app from "../../src/api/app.js";
import type { Node } from "../../src/spd/ast.js";
import * as ast_utils from "../../src/spd/ast.js";
import * as parser from "../../src/spd/parser.js";

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

  it("should download pretty printed AST JSON successfully via /ast/parse/download", async () => {
    const spd = ":terminal Start\nProcess\n:terminal End";
    const serializeSpy = jest.spyOn(ast_utils.astUtils, "serializeAST");

    const res = await app.request("/ast/parse/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd, options: { prettyprint: true } }),
    });

    expect(res.status).toBe(200);
    expect(serializeSpy).toHaveBeenCalledWith(expect.anything(), 2);

    serializeSpy.mockRestore();
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

  it("should return 400 if SPD is an empty string in /ast/parse/download", async () => {
    const res = await app.request("/ast/parse/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd: "" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("SPD content is required");
  });

  it("should return 400 if exception occurs in /ast/parse/download", async () => {
    const originalParse = parser.parser.parse;
    (parser.parser as unknown as { parse: jest.Mock }).parse = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Custom parse error");
      });

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
      expect(body.error).toBe("Custom parse error");
    } finally {
      (parser.parser as unknown as { parse: typeof originalParse }).parse =
        originalParse;
    }
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

  it("should return 400 if AST is an empty string in /ast/render/download", async () => {
    const res = await app.request("/ast/render/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ast: "" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("AST is required");
  });

  it("should return 400 if parse fails in /ast/parse/download", async () => {
    const originalParse = parser.parser.parse;
    (parser.parser as unknown as { parse: jest.Mock }).parse = jest
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
      (parser.parser as unknown as { parse: typeof originalParse }).parse =
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

  it("should return 400 if deserializeAST fails in /ast/render/download", async () => {
    const originalDeserialize = ast_utils.astUtils.deserializeAST;
    (
      ast_utils.astUtils as unknown as { deserializeAST: jest.Mock }
    ).deserializeAST = jest.fn().mockReturnValue(null);

    try {
      const res = await app.request("/ast/render/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ast: { type: "nodeList", children: [] } }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Invalid AST format");
    } finally {
      (
        ast_utils.astUtils as unknown as {
          deserializeAST: typeof originalDeserialize;
        }
      ).deserializeAST = originalDeserialize;
    }
  });

  it("should return 500 if exception occurs in /ast/render/download", async () => {
    const originalDeserialize = ast_utils.astUtils.deserializeAST;
    (
      ast_utils.astUtils as unknown as { deserializeAST: jest.Mock }
    ).deserializeAST = jest.fn().mockImplementation(() => {
      throw new Error("Custom render error");
    });

    try {
      const res = await app.request("/ast/render/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ast: { type: "nodeList", children: [] } }),
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Custom render error");
    } finally {
      (
        ast_utils.astUtils as unknown as {
          deserializeAST: typeof originalDeserialize;
        }
      ).deserializeAST = originalDeserialize;
    }
  });
});
