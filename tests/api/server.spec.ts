import { serve } from "@hono/node-server";
import { jest } from "@jest/globals";
import { startServer } from "../../src/api/server.js";

// @hono/node-server をモックして実際にポートを開かないようにする
jest.mock("@hono/node-server", () => ({
  serve: jest.fn().mockReturnValue({
    close: jest.fn(),
  }),
}));

describe("Server Startup", () => {
  let consoleSpy: any;

  beforeEach(() => {
    // ログ出力をモックする
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("should log correct startup messages (起動時に正しいログメッセージを出力すること)", () => {
    const testPort = 3000;
    const server = startServer(testPort);

    // serve が呼ばれたことを確認
    expect(serve).toHaveBeenCalledWith(
      expect.objectContaining({
        port: testPort,
      }),
    );

    // ログ出力を確認
    expect(consoleSpy).toHaveBeenCalledWith(
      `Server is running on http://localhost:${testPort}`,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      `Swagger UI available at http://localhost:${testPort}/docs`,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      `OpenAPI spec available at http://localhost:${testPort}/openapi.json`,
    );

    // モックされたサーバーを閉じる（クリーンアップのシミュレーション）
    server.close();
  });
});
