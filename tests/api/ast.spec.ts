import app from "../../src/api/app";

/**
 * /ast/parse および /ast/render エンドポイントのテスト
 */
describe("API AST Endpoints", () => {
  let sharedAst: any;

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
});
