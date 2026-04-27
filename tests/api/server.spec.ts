import { serve } from "@hono/node-server";
import { startServer } from "../../src/api/server";

// @hono/node-server をモックして実際にポートを開かないようにする
jest.mock("@hono/node-server", () => ({
  serve: jest.fn().mockReturnValue({
    close: jest.fn(),
  }),
}));

describe("Server Startup", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // console.log をスパイする
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
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
      `Swagger UI available at http://localhost:${testPort}/api-docs`,
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      `OpenAPI spec available at http://localhost:${testPort}/doc`,
    );

    // モックされたサーバーを閉じる（クリーンアップのシミュレーション）
    server.close();
  });
});
