import type { CallToolResult } from '@modelcontextprotocol/server';

// structuredContent を読まない古いクライアント向けに、同じ内容を text にも入れる
export const toolResult = (
  structuredContent: Record<string, unknown>,
): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
  structuredContent,
});

export const toolError = (message: string): CallToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});
