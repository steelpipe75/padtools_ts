import app from "../../src/api/app";
import type { Node } from "../../src/spd/ast";
import * as ast_utils from "../../src/spd/ast";
import * as parser from "../../src/spd/parser";

/**
 * /ast/parse および /ast/render エンドポイントのテスト
 */
describe("API AST Endpoints", () => {
  let sharedAst: Node;

  it("should parse SPD to AST JSON successfully (SPDからAST JSONへのパースが成功すること)", async () => {
    const spd = ":terminal Start\nProcess\n:terminal End";
    const res = await app.request("/ast/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ast");
    expect(body.ast.type).toBe("nodeList");
    sharedAst = body.ast;
  });

  it("should parse SPD to pretty printed AST JSON successfully", async () => {
    const spd = ":terminal Start\nProcess\n:terminal End";
    // We need to capture the raw response to check formatting, but Hono's c.json()
    // might re-stringify it. However, our handler does JSON.parse(serializeAST(ast, 2)),
    // so the object itself will be the same.
    // Wait, if we return it as an object, Hono will stringify it again.
    // Let's check if we can verify that serializeAST was called with space=2.

    const serializeSpy = jest.spyOn(ast_utils, "serializeAST");

    const res = await app.request("/ast/parse", {
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

  it("should render AST JSON to SVG successfully (AST JSONからSVGへのレンダリングが成功すること)", async () => {
    const res = await app.request("/ast/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ast: sharedAst }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("svg");
    expect(body.svg).toContain("<svg");
  });

  it("should handle SwitchNode with Map correctly (Mapを含むSwitchNodeを正しく処理できること)", async () => {
    const spd = ":switch case\n:case 1\n\tone\n:case 2\n\ttwo";
    const parseRes = await app.request("/ast/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd }),
    });

    expect(parseRes.status).toBe(200);
    const parseBody = await parseRes.json();

    // SwitchNodeのcasesが__type: "Map"としてシリアライズされていることを確認
    const switchNode = parseBody.ast.children[0];
    expect(switchNode.type).toBe("switch");
    expect(switchNode.cases.__type).toBe("Map");

    const renderRes = await app.request("/ast/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ast: parseBody.ast }),
    });

    expect(renderRes.status).toBe(200);
    const renderBody = await renderRes.json();
    expect(renderBody.svg).toContain("<svg");
  });

  it("should return 400 if SPD is missing in parse (パース時にSPDが欠落している場合に400を返すこと)", async () => {
    const res = await app.request("/ast/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("should return 400 if AST is missing in render (レンダリング時にASTが欠落している場合に400を返すこと)", async () => {
    const res = await app.request("/ast/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  describe("API /ast error cases", () => {
    it("should return 400 if parse fails in /ast/parse", async () => {
      // Mock parse to return null
      const originalParse = parser.parse;
      (parser as unknown as { parse: jest.Mock }).parse = jest
        .fn()
        .mockReturnValue(null);

      try {
        const res = await app.request("/ast/parse", {
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

    it("should return 400 if exception occurs in /ast/parse", async () => {
      const originalParse = parser.parse;
      (parser as unknown as { parse: jest.Mock }).parse = jest
        .fn()
        .mockImplementation(() => {
          throw new Error("Custom parse error");
        });

      try {
        const res = await app.request("/ast/parse", {
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
        (parser as unknown as { parse: typeof originalParse }).parse =
          originalParse;
      }
    });

    it("should return 400 if exception occurs in /ast/parse (Errorオブジェクト以外がスローされた場合)", async () => {
      const originalParse = parser.parse;
      (parser as unknown as { parse: jest.Mock }).parse = jest
        .fn()
        .mockImplementation(() => {
          throw "Non-Error object";
        });

      try {
        const res = await app.request("/ast/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ spd: "test" }),
        });

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Failed to parse AST");
      } finally {
        (parser as unknown as { parse: typeof originalParse }).parse =
          originalParse;
      }
    });

    it("should return 400 if SPD is an empty string in /ast/parse", async () => {
      const res = await app.request("/ast/parse", {
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

    it("should return 400 if deserializeAST fails in /ast/render", async () => {
      const originalDeserialize = ast_utils.deserializeAST;
      (ast_utils as unknown as { deserializeAST: jest.Mock }).deserializeAST =
        jest.fn().mockReturnValue(null);

      try {
        const res = await app.request("/ast/render", {
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
          ast_utils as unknown as { deserializeAST: typeof originalDeserialize }
        ).deserializeAST = originalDeserialize;
      }
    });

    it("should return 500 if exception occurs in /ast/render", async () => {
      const originalDeserialize = ast_utils.deserializeAST;
      (ast_utils as unknown as { deserializeAST: jest.Mock }).deserializeAST =
        jest.fn().mockImplementation(() => {
          throw new Error("Custom render error");
        });

      try {
        const res = await app.request("/ast/render", {
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
          ast_utils as unknown as { deserializeAST: typeof originalDeserialize }
        ).deserializeAST = originalDeserialize;
      }
    });

    it("should return 500 if exception occurs in /ast/render (Errorオブジェクト以外がスローされた場合)", async () => {
      const originalDeserialize = ast_utils.deserializeAST;
      (ast_utils as unknown as { deserializeAST: jest.Mock }).deserializeAST =
        jest.fn().mockImplementation(() => {
          throw "Non-Error object";
        });

      try {
        const res = await app.request("/ast/render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ast: { type: "nodeList", children: [] } }),
        });

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to render AST");
      } finally {
        (
          ast_utils as unknown as { deserializeAST: typeof originalDeserialize }
        ).deserializeAST = originalDeserialize;
      }
    });

    it("should return 400 if AST is an empty string in /ast/render", async () => {
      const res = await app.request("/ast/render", {
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

    it("should render AST JSON with options successfully", async () => {
      const res = await app.request("/ast/render", {
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
      const body = await res.json();
      expect(body).toHaveProperty("svg");
    });
  });
});
