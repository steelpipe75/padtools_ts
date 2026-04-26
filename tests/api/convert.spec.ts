import request from "supertest";
import app from "../../src/api/server";

/**
 * /api/convert エンドポイントのテスト
 * SPD (Simple PAD Description) テキストを SVG に変換する機能を検証します。
 */
describe("API /api/convert", () => {
  // 正常系のテスト: 正しい SPD テキストが SVG に変換されること
  it("should convert SPD to SVG successfully (SPDからSVGへの変換が成功すること)", async () => {
    const spd = "process: Start\nterminal: End";
    const response = await request(app).post("/api/convert").send({ spd });

    // ステータスコード 200 (OK) を確認
    expect(response.status).toBe(200);
    // レスポンスボディに svg プロパティが含まれていることを確認
    expect(response.body).toHaveProperty("svg");
    expect(typeof response.body.svg).toBe("string");
    // 生成された文字列が SVG 形式であることを簡易的に確認
    expect(response.body.svg).toContain("<svg");
  });

  // 異常系のテスト: SPD パラメータが欠落している場合
  it("should return 400 if SPD is missing (SPDが欠落している場合に400エラーを返すこと)", async () => {
    const response = await request(app).post("/api/convert").send({});

    // ステータスコード 400 (Bad Request) を確認
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "SPD content is required and must be a string",
    );
  });

  // 異常系のテスト: SPD パラメータが文字列でない場合
  it("should return 400 if SPD is not a string (SPDが文字列でない場合に400エラーを返すこと)", async () => {
    const response = await request(app).post("/api/convert").send({ spd: 123 });

    // ステータスコード 400 (Bad Request) を確認
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "SPD content is required and must be a string",
    );
  });

  // オプション指定のテスト: レンダリングオプションが正しく適用されること
  it("should apply all rendering options (すべてのレンダリングオプションが適用されること)", async () => {
    const spd = "process: Start";
    const options = {
      fontSize: 20,
      fontFamily: "Arial",
      strokeWidth: 2,
      strokeColor: "#0000FF",
      backgroundColor: "#FFFF00",
      baseBackgroundColor: "#000000",
      textColor: "#FF0000",
      lineHeight: 1.5,
      listRenderType: "TerminalOffset",
      prettyprint: true,
    };

    const response = await request(app)
      .post("/api/convert")
      .send({ spd, options });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("svg");
    expect(response.body.svg).toContain("<svg");
    // XML フォーマットされているか（改行が含まれるか）の簡易確認
    expect(response.body.svg).toContain("\n");
  });

  // オプション指定のテスト: prettyprint が false の場合
  it("should return minified SVG if prettyprint is false (prettyprint が false の場合に最小化された SVG を返すこと)", async () => {
    const spd = "process: Start";
    const options = {
      prettyprint: false,
    };

    const response = await request(app)
      .post("/api/convert")
      .send({ spd, options });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("svg");
    // svgo によって最適化されていることを確認（通常は改行が除去される）
    expect(response.body.svg).not.toContain("\n");
  });

  // 異常系のテスト: パースエラー発生時の挙動
  it("should handle parser errors with 500 status (パースエラー時に500エラーを返すこと)", async () => {
    // 未知のコマンド（: で始まる）を含む SPD を送信して ParseError を誘発させる
    const spd = ":invalid_command arg";
    const response = await request(app).post("/api/convert").send({ spd });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "error",
      "Failed to convert SPD to SVG",
    );
  });

  // Swagger UI のテスト
  it("should serve Swagger UI (Swagger UI が提供されていること)", async () => {
    const response = await request(app).get("/api-docs/");
    // Swagger UI (HTML) が返ってくることを確認
    expect(response.status).toBe(200);
    expect(response.text).toContain("<html");
  });
});
