import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT) || 3000;

export const startServer = (p: number) => {
  const server = serve({
    fetch: app.fetch,
    port: p,
  });
  console.log(`Server is running on http://localhost:${p}`);
  console.log(`Swagger UI available at http://localhost:${p}/docs`);
  console.log(`OpenAPI spec available at http://localhost:${p}/openapi.json`);
  return server;
};

// Check if this file is run directly
let isMain = false;
if (typeof __filename !== "undefined") {
  isMain = process.argv[1]
    ? fs.realpathSync(__filename) === fs.realpathSync(process.argv[1])
    : false;
} else {
  const metaUrl = import.meta.url;
  isMain = process.argv[1]
    ? fs.realpathSync(fileURLToPath(metaUrl)) ===
      fs.realpathSync(process.argv[1])
    : false;
}

// Start server
if (
  isMain &&
  // @ts-expect-error: Bun is only defined in Bun environment
  typeof Bun === "undefined"
) {
  startServer(port);
}
