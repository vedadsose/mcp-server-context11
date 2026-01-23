import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest, extractTextFromTiptap } from "./api.js";
import type {
  SearchResult,
  Document,
  Folder,
  FolderDocumentsResponse,
} from "./types.js";

export function registerTools(
  server: McpServer,
  getApiKey: () => string,
  getApiUrl: () => string
): void {
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
          getApiKey(),
          getApiUrl(),
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
        const doc = await apiRequest<Document>(
          `/api/mcp/documents/${id}`,
          getApiKey(),
          getApiUrl()
        );
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

  // Tool: List all folders
  server.tool(
    "list_folders",
    "List all folders in the workspace",
    {},
    async () => {
      try {
        const { folders } = await apiRequest<{ folders: Folder[] }>(
          "/api/mcp/folders",
          getApiKey(),
          getApiUrl()
        );

        if (folders.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "No folders found in the workspace.",
              },
            ],
          };
        }

        const formatted = folders
          .map(
            (f) =>
              `- **${f.name}** (ID: ${f.id})\n  Documents: ${f.documentCount}, Subfolders: ${f.childFolderCount}${
                f.parentId ? `\n  Parent: ${f.parentId}` : ""
              }`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `Found ${folders.length} folder(s):\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing folders: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: List documents in a folder
  server.tool(
    "list_documents",
    "List all documents in a specific folder",
    {
      folderId: z.string().describe("The folder ID to list documents from"),
    },
    async ({ folderId }) => {
      try {
        const response = await apiRequest<FolderDocumentsResponse>(
          `/api/mcp/folders/${folderId}/documents`,
          getApiKey(),
          getApiUrl()
        );

        if (response.documents.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No documents found in folder "${response.folder.name}".`,
              },
            ],
          };
        }

        const formatted = response.documents
          .map(
            (d) =>
              `- **${d.title}** (ID: ${d.id})\n  Created: ${d.createdAt}\n  Updated: ${d.updatedAt}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `Folder: ${response.folder.name}\n\nFound ${response.documents.length} document(s):\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing documents: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Read document content
  server.tool(
    "read_document",
    "Read a document's full content by ID",
    {
      documentId: z.string().describe("The document ID to read"),
    },
    async ({ documentId }) => {
      try {
        const doc = await apiRequest<Document>(
          `/api/mcp/documents/${documentId}`,
          getApiKey(),
          getApiUrl()
        );
        const plainText = extractTextFromTiptap(doc.content);

        return {
          content: [
            {
              type: "text" as const,
              text: `# ${doc.title}\n\nFolder: ${doc.folderName}\nCreated: ${doc.createdAt}\nUpdated: ${doc.updatedAt}\n\n---\n\n${plainText}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error reading document: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Update document
  server.tool(
    "update_document",
    "Update a document's title and/or content. Content must be in Tiptap JSON format.",
    {
      documentId: z.string().describe("The document ID to update"),
      title: z.string().optional().describe("New title for the document"),
      content: z
        .string()
        .optional()
        .describe(
          'New content in Tiptap JSON format. Example: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Your text here"}]}]}'
        ),
    },
    async ({ documentId, title, content }) => {
      try {
        if (!title && !content) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: At least one of 'title' or 'content' must be provided.",
              },
            ],
            isError: true,
          };
        }

        const body: { title?: string; content?: string } = {};
        if (title) body.title = title;
        if (content) body.content = content;

        const doc = await apiRequest<Document>(
          `/api/mcp/documents/${documentId}`,
          getApiKey(),
          getApiUrl(),
          {
            method: "PATCH",
            body: JSON.stringify(body),
          }
        );
        const plainText = extractTextFromTiptap(doc.content);

        return {
          content: [
            {
              type: "text" as const,
              text: `Document updated successfully!\n\n# ${doc.title}\n\nFolder: ${doc.folderName}\nUpdated: ${doc.updatedAt}\n\n---\n\n${plainText}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error updating document: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
