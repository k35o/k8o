import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { READ_ONLY_TOOL_ANNOTATIONS } from '../../../shared/mcp/read-only-annotations';
import { toolResult } from '../../../shared/mcp/tool-result';
import { listArticleSources } from '../application/article-sources';

export const registerReadingListTools = (server: McpServer): void => {
  server.registerTool(
    'list_article_sources',
    {
      title: 'reading-list の記事ソース一覧',
      description:
        'reading-list が毎日記事を取り込むソースを登録順に返す。type は feed（RSS・Atom）か browser-releases（browser-compat-data の版の一覧）。ソースはマイグレーションで足す。',
      inputSchema: z.object({}),
      outputSchema: z.object({
        sources: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            url: z.string(),
            type: z.enum(['feed', 'browser-releases']),
            createdAt: z.string(),
          }),
        ),
      }),
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async () => toolResult(await listArticleSources()),
  );
};
