import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';

import { registerBlogTools } from './features/blog/interface/mcp-tools';
import { registerInquiryTools } from './features/inquiries/interface/mcp-tools';
import { registerOverviewTools } from './features/overview/interface/mcp-tools';
import { registerReportTools } from './features/reports/interface/mcp-tools';

const createMcpServer = (): McpServer => {
  // tool の一覧は変わらない。listChanged を広告すると新しい版のクライアントが通知用の
  // SSE を張り続け、Vercel の関数を占有するため、明示的に false にする
  const server = new McpServer(
    { name: 'k8o', version: '1.0.0' },
    { capabilities: { tools: { listChanged: false } } },
  );
  registerOverviewTools(server);
  registerInquiryTools(server);
  registerBlogTools(server);
  registerReportTools(server);
  return server;
};

export const mcpHandler = createMcpHandler(createMcpServer, {
  onerror: (error) => {
    console.error('MCP の処理に失敗しました:', error);
  },
});
