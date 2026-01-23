# Context11 MCP Server

[![npm version](https://img.shields.io/npm/v/context11-mcp.svg)](https://www.npmjs.com/package/context11-mcp)

An MCP (Model Context Protocol) server that provides access to your [Context11](https://context11.com) knowledge base for AI assistants.

## Installation

```bash
npm install context11-mcp
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONTEXT11_API_KEY` | Your Context11 API key (starts with `ctx11_`) | Yes |
| `CONTEXT11_URL` | API base URL (default: `https://context11.com`) | No |

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "context11": {
      "command": "npx",
      "args": ["-y", "context11-mcp"],
      "env": {
        "CONTEXT11_API_KEY": "ctx11_your_api_key_here"
      }
    }
  }
}
```

### Local Development

For local testing against a development server:

```json
{
  "mcpServers": {
    "context11": {
      "command": "npx",
      "args": ["-y", "context11-mcp"],
      "env": {
        "CONTEXT11_API_KEY": "ctx11_your_api_key_here",
        "CONTEXT11_URL": "http://localhost:3000"
      }
    }
  }
}
```

### From Source

```json
{
  "mcpServers": {
    "context11": {
      "command": "node",
      "args": ["/path/to/context11-mcp/dist/index.js"],
      "env": {
        "CONTEXT11_API_KEY": "ctx11_your_api_key_here"
      }
    }
  }
}
```

## Tools

### search_context

Search the company knowledge base for relevant context, guidelines, and rules.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `query` | string | What to search for in the knowledge base |
| `limit` | number | Maximum number of results (default: 10) |

**Example:**

```json
{
  "query": "brand guidelines",
  "limit": 5
}
```

### get_document

Get the full content of a specific document by ID.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Document ID from search results |

**Example:**

```json
{
  "id": "abc123"
}
```

### list_folders

List all folders in the workspace.

**Parameters:** None

**Example Response:**

```
Found 2 folder(s):

- **Engineering** (ID: abc123)
  Documents: 5, Subfolders: 2

- **Marketing** (ID: def456)
  Documents: 3, Subfolders: 0
```

### list_documents

List all documents in a specific folder.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `folderId` | string | The folder ID to list documents from |

**Example:**

```json
{
  "folderId": "abc123"
}
```

### read_document

Read a document's full content by ID.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `documentId` | string | The document ID to read |

**Example:**

```json
{
  "documentId": "abc123"
}
```

### update_document

Update a document's title and/or content. Content must be in Tiptap JSON format.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `documentId` | string | The document ID to update |
| `title` | string | (Optional) New title for the document |
| `content` | string | (Optional) New content in Tiptap JSON format |

**Example:**

```json
{
  "documentId": "abc123",
  "title": "Updated Title",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Hello world\"}]}]}"
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
