#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration
const API_KEY = process.env.CONTEXT11_API_KEY;
const API_URL = process.env.CONTEXT11_URL || "https://context11.com";

if (!API_KEY) {
  console.error("Error: CONTEXT11_API_KEY environment variable is required");
  process.exit(1);
}

// Types
interface SearchResult {
  score: number;
  documentId: string;
  folderId: string;
  title: string;
  preview: string;
  chunkIndex: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  folderId: string;
  folderName: string;
  createdAt: string;
  updatedAt: string;
}

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

// Helper: Extract plain text from Tiptap JSON
function extractTextFromTiptap(content: string): string {
  try {
    const json = JSON.parse(content) as TiptapNode;
    return extractTextFromNode(json);
  } catch {
    return content; // Return as-is if not valid JSON
  }
}

function extractTextFromNode(node: TiptapNode): string {
  if (!node) return "";
  if (node.type === "text" && node.text) return node.text;
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map(extractTextFromNode)
      .join(node.type === "paragraph" ? "\n\n" : "")
      .trim();
  }
  return "";
}

// Helper: Make API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// Create MCP Server
const server = new McpServer({
  name: "context11",
  version: "1.0.0",
});

// Tool: Search knowledge base
server.tool(
  "search_context",
  "Search the company knowledge base for relevant context, guidelines, and rules",
  {
    query: z.string().describe("What to search for in the knowledge base"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return (default: 10)"),
  },
  async ({ query, limit }) => {
    try {
      const { results } = await apiRequest<{ results: SearchResult[] }>(
        "/api/mcp/search",
        {
          method: "POST",
          body: JSON.stringify({ query, limit }),
        }
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No results found for your search query.",
            },
          ],
        };
      }

      const formatted = results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}** (score: ${r.score.toFixed(2)})\n   ID: ${
              r.documentId
            }\n   ${r.preview}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${results.length} result(s):\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching knowledge base: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get document by ID
server.tool(
  "get_document",
  "Get the full content of a specific document by ID",
  {
    id: z.string().describe("Document ID from search results"),
  },
  async ({ id }) => {
    try {
      const doc = await apiRequest<Document>(`/api/mcp/documents/${id}`);
      const plainText = extractTextFromTiptap(doc.content);

      return {
        content: [
          {
            type: "text" as const,
            text: `# ${doc.title}\n\nFolder: ${doc.folderName}\nLast updated: ${doc.updatedAt}\n\n---\n\n${plainText}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error retrieving document: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
