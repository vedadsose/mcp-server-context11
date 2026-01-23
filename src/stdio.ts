#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./core/tools.js";

const API_KEY = process.env.CONTEXT11_API_KEY;
const API_URL = process.env.CONTEXT11_URL || "https://context11.com";

if (!API_KEY) {
  console.error("Error: CONTEXT11_API_KEY environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "context11",
  version: "1.2.0",
});

registerTools(
  server,
  () => API_KEY,
  () => API_URL
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
