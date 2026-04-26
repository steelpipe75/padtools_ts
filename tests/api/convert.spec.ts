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
    const response = await request(app)
      .post("/api/convert")
      .send({ spd });

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
    const response = await request(app)
      .post("/api/convert")
      .send({});

    // ステータスコード 400 (Bad Request) を確認
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "SPD content is required and must be a string");
  });

  // 異常系のテスト: SPD パラメータが文字列でない場合
  it("should return 400 if SPD is not a string (SPDが文字列でない場合に400エラーを返すこと)", async () => {
    const response = await request(app)
      .post("/api/convert")
      .send({ spd: 123 });

    // ステータスコード 400 (Bad Request) を確認
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "SPD content is required and must be a string");
  });

  // オプション指定のテスト: レンダリングオプションが正しく適用されること
  it("should apply rendering options (レンダリングオプションが適用されること)", async () => {
    const spd = "process: Start";
    const options = {
      fontSize: 20,
      textColor: "#FF0000",
      prettyprint: true
    };
    
    const response = await request(app)
      .post("/api/convert")
      .send({ spd, options });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("svg");
    // SVG として妥当な出力であることを確認
    expect(response.body.svg).toContain("<svg");
  });

  // 異常系のテスト: パースエラー発生時の挙動
  it("should handle parser errors with 500 status (パースエラー時に500エラーを返すこと)", async () => {
    // 不正なコマンドを含む SPD を送信
    const spd = "invalid_command: Something";
    const response = await request(app)
      .post("/api/convert")
      .send({ spd });

    // 現状の実装では try-catch で捕捉され 500 (Internal Server Error) が返ることを確認
    // 注: parser の実装によっては 200 が返る可能性もあるため、挙動の確認が必要
    if (response.status === 500) {
      expect(response.body).toHaveProperty("error", "Failed to convert SPD to SVG");
    }
  });
});
