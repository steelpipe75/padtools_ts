import app from "../../src/api/app.js";
import { SPD_EXPLANATION } from "../../src/spd/docs.js";

describe("API /spd-info", () => {
  it("should return SPD explanation (SPD記法の説明を返すこと)", async () => {
    const res = await app.request("/spd-info");

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body).toHaveProperty("explanation");
    expect(body.explanation).toBe(SPD_EXPLANATION);
    expect(body.explanation).toContain(
      "# SPD (Simple PAD Description) 記法リファレンス",
    );
  });
});
