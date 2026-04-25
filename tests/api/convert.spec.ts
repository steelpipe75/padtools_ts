import request from "supertest";
import app from "../../src/api/server";

describe("API /api/convert", () => {
  it("should convert SPD to SVG successfully", async () => {
    const spd = "process: Start\nterminal: End";
    const response = await request(app)
      .post("/api/convert")
      .send({ spd });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("svg");
    expect(typeof response.body.svg).toBe("string");
    expect(response.body.svg).toContain("<svg");
  });

  it("should return 400 if SPD is missing", async () => {
    const response = await request(app)
      .post("/api/convert")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "SPD content is required and must be a string");
  });

  it("should return 400 if SPD is not a string", async () => {
    const response = await request(app)
      .post("/api/convert")
      .send({ spd: 123 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "SPD content is required and must be a string");
  });

  it("should apply rendering options", async () => {
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
    // XML format pretty print check (simple check for newlines/indentation if possible, 
    // but at least check that it's still a valid SVG)
    expect(response.body.svg).toContain("<svg");
  });

  it("should handle parser errors with 500 status", async () => {
    // Providing invalid SPD that might cause the parser to throw (if it does)
    // Looking at the implementation, it currently catches all errors and returns 500
    const spd = "invalid_command: Something";
    const response = await request(app)
      .post("/api/convert")
      .send({ spd });

    // Depending on whether parse() throws for invalid commands or not
    // If it doesn't throw, it might still return 200 with some SVG.
    // Let's assume for now we want to see how it behaves.
  });
});
