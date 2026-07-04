import "../polyfills.js";
import * as fs from "node:fs";
import { serve } from "@hono/node-server";
import app from "./app.js";
const port = Number(process.env.PORT) || 3000;
export const startServer = (p) => {
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
const argv1 = process.argv[1]
    ? fs.realpathSync(process.argv[1]).replace(/\\/g, "/")
    : "";
const isMain = argv1.endsWith("src/api/server.ts") ||
    argv1.endsWith("src/api/server.js") ||
    argv1.endsWith("dist/api/server.js");
// Start server
if (isMain &&
    // @ts-expect-error: Bun is only defined in Bun environment
    typeof Bun === "undefined") {
    startServer(port);
}
