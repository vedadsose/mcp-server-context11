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
