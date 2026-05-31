import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./app.js";
const transport = new StdioServerTransport();
await mcpServer.connect(transport);
