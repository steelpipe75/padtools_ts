import { serve } from "@hono/node-server";
import app from "./app";

const port = Number(process.env.PORT) || 3000;

export const startServer = (p: number) => {
  const server = serve({
    fetch: app.fetch,
    port: p,
  });
  console.log(`Server is running on http://localhost:${p}`);
  console.log(`Swagger UI available at http://localhost:${p}/api-docs`);
  console.log(`OpenAPI spec available at http://localhost:${p}/doc`);
  return server;
};

// Start server
if (
  require.main === module &&
  // @ts-expect-error: Bun is only defined in Bun environment
  typeof Bun === "undefined"
) {
  startServer(port);
}
