import type { TiptapNode } from "./types.js";

const DEFAULT_API_URL = "https://context11.com";

export function extractTextFromTiptap(content: string): string {
  try {
    const json = JSON.parse(content) as TiptapNode;
    return extractTextFromNode(json);
  } catch {
    return content;
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

export async function apiRequest<T>(
  endpoint: string,
  apiKey: string,
  apiUrl: string = DEFAULT_API_URL,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}
