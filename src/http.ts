#!/usr/bin/env node
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerTools } from "./core/tools.js";

const PORT = process.env.PORT || 3000;
const API_URL = process.env.CONTEXT11_URL || "https://context11.com";

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "1.2.0" });
});

// MCP endpoint
app.post("/mcp", async (req, res) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Missing X-API-Key header" },
      id: null,
    });
    return;
  }

  const server = new McpServer({
    name: "context11",
    version: "1.2.0",
  });

  registerTools(
    server,
    () => apiKey,
    () => API_URL
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`Context11 MCP HTTP server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
