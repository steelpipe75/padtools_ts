import app from "../../src/api/server";

/**
 * /api/convert エンドポイントのテスト
 * SPD (Simple PAD Description) テキストを SVG に変換する機能を検証します。
 */
describe("API /api/convert", () => {
  // 正常系のテスト: 正しい SPD テキストが SVG に変換されること
  it("should convert SPD to SVG successfully (SPDからSVGへの変換が成功すること)", async () => {
    const spd = "process: Start\nterminal: End";
    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd }),
    });

    // ステータスコード 200 (OK) を確認
    expect(res.status).toBe(200);
    const body = await res.json();
    // レスポンスボディに svg プロパティが含まれていることを確認
    expect(body).toHaveProperty("svg");
    expect(typeof body.svg).toBe("string");
    // 生成された文字列が SVG 形式であることを簡易的に確認
    expect(body.svg).toContain("<svg");
  });

  // 異常系のテスト: SPD パラメータが欠落している場合
  it("should return 400 if SPD is missing (SPDが欠落している場合に400エラーを返すこと)", async () => {
    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // Zodバリデーションにより 400 (Bad Request) を確認
    expect(res.status).toBe(400);
  });

  // 異常系のテスト: SPD が空文字の場合 (手動バリデーションのカバー)
  it("should return 400 if SPD is an empty string (SPDが空文字の場合に400エラーを返すこと)", async () => {
    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd: "" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "SPD content is required");
  });

  // 異常系のテスト: SPD パラメータが文字列でない場合
  it("should return 400 if SPD is not a string (SPDが文字列でない場合に400エラーを返すこと)", async () => {
    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd: 123 }),
    });

    // Zodバリデーションにより 400 (Bad Request) を確認
    expect(res.status).toBe(400);
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

    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd, options }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("svg");
    expect(body.svg).toContain("<svg");
    // XML フォーマットされているか（改行が含まれるか）の簡易確認
    expect(body.svg).toContain("\n");
  });

  // オプション指定のテスト: prettyprint が false の場合
  it("should return minified SVG if prettyprint is false (prettyprint が false の場合に最小化された SVG を返すこと)", async () => {
    const spd = "process: Start";
    const options = {
      prettyprint: false,
    };

    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd, options }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("svg");
    // svgo によって最適化されていることを確認（通常は改行が除去される）
    expect(body.svg).not.toContain("\n");
  });

  // /convert/download エンドポイントのテスト
  describe("POST /convert/download", () => {
    it("should download SVG successfully (SVGのダウンロードが成功すること)", async () => {
      const spd = "process: Start\nterminal: End";
      const res = await app.request("/convert/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spd }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
      expect(res.headers.get("Content-Disposition")).toBe(
        'attachment; filename="diagram.svg"',
      );

      const text = await res.text();
      expect(text).toContain("<svg");
    });

    it("should apply options in download (ダウンロード時にオプションが適用されること)", async () => {
      const spd = "process: Start";
      const options = {
        prettyprint: true,
      };

      const res = await app.request("/convert/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spd, options }),
      });

      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain("\n"); // prettyprint
    });

    it("should return 400 if SPD is missing for download (ダウンロード時にSPDが欠落している場合に400エラーを返すこと)", async () => {
      const res = await app.request("/convert/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  // 異常系のテスト: パースエラー発生時の挙動
  it("should handle parser errors with 500 status (パースエラー時に500エラーを返すこと)", async () => {
    // 未知のコマンド（: で始まる）を含む SPD を送信して ParseError を誘発させる
    const spd = ":invalid_command arg";
    const res = await app.request("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spd }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Failed to convert SPD to SVG");
  });

  // Swagger UI のテスト
  it("should serve Swagger UI (Swagger UI が提供されていること)", async () => {
    const res = await app.request("/api-docs/");
    // Swagger UI (HTML) が返ってくることを確認
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<html");
  });

  // OpenAPI ドキュメントのテスト
  it("should serve OpenAPI doc (OpenAPI ドキュメントが提供されていること)", async () => {
    const res = await app.request("/doc");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("3.0.0");
    expect(body.info.title).toBe("PAD Tools API");
  });

  // ルートリダイレクトのテスト
  it("should redirect from / to /api-docs/ (ルートから/api-docs/へリダイレクトされること)", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/api-docs/");
  });

  // ヘルスチェックのテスト
  it("should return 200 OK for health check (ヘルスチェックが200 OKを返すこと)", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});
