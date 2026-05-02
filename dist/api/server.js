"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const node_server_1 = require("@hono/node-server");
const app_1 = __importDefault(require("./app"));
const port = Number(process.env.PORT) || 3000;
const startServer = (p) => {
    const server = (0, node_server_1.serve)({
        fetch: app_1.default.fetch,
        port: p,
    });
    console.log(`Server is running on http://localhost:${p}`);
    console.log(`Swagger UI available at http://localhost:${p}/api-docs`);
    console.log(`OpenAPI spec available at http://localhost:${p}/doc`);
    return server;
};
exports.startServer = startServer;
// Start server
if (require.main === module &&
    // @ts-expect-error: Bun is only defined in Bun environment
    typeof Bun === "undefined") {
    (0, exports.startServer)(port);
}
