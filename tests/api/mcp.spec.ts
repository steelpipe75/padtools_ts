import app from "../../src/api/app";

/**
 * /mcp エンドポイントのテスト
 * MCP (Model Context Protocol) サーバーへの接続と通信を検証します。
 */
describe("API /mcp", () => {
  // SSE エンドポイントの導通確認
  it("should return SSE stream for GET /mcp (GET /mcp が SSE ストリームを返すこと)", async () => {
    const res = await app.request("/mcp", {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
    });

    // ステータスコード 200 (OK) を確認
    expect(res.status).toBe(200);

    // Content-Type が text/event-stream であることを確認
    const contentType = res.headers.get("Content-Type");
    expect(contentType).toContain("text/event-stream");

    // レスポンスボディが存在することを確認
    expect(res.body).toBeDefined();

    // 注意: Jest 環境下での ReadableStream の継続的な読み取りはタイムアウトしやすいため、
    // 導通確認としてはステータスとヘッダーの確認を優先します。
    if (res.body) {
      const reader = res.body.getReader();
      await reader.cancel();
    }
  });

  // CORS 設定の確認
  it("should have CORS headers (CORS ヘッダーが設定されていること)", async () => {
    const res = await app.request("/mcp", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
      },
    });

    // CORS ミドルウェアにより OPTIONS リクエストが適切に処理されることを確認
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  // POST リクエストの確認 (セッションなし)
  it("should return 400 or 406 for POST /mcp without sessionId (sessionId なしの POST /mcp がエラーを返すこと)", async () => {
    const res = await app.request("/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1.0.0" },
        },
      }),
    });

    // sessionId がないため、エラー（400 Bad Request または 406 Not Acceptable）が返ることを確認
    expect([400, 406]).toContain(res.status);
  });
});
