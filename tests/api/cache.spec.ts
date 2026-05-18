import app from "../../src/api/app";

describe("API Cache Control", () => {
  const routes = ["/health", "/spd-info", "/openapi.json", "/docs/"];

  for (const route of routes) {
    it(`should have no-cache headers for ${route}`, async () => {
      const res = await app.request(route);

      // status check (docs/ redirects, others should be 200 or something valid)
      expect(res.status).toBeLessThan(400);

      expect(res.headers.get("Cache-Control")).toBe(
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      expect(res.headers.get("Pragma")).toBe("no-cache");
      expect(res.headers.get("Expires")).toBe("0");
    });
  }

  it("should have no-cache headers for POST requests like /convert", async () => {
    const res = await app.request("/convert", {
      method: "POST",
      body: JSON.stringify({ spd: "Process" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
  });
});
