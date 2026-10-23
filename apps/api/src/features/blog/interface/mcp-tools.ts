import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { toolResult } from '../../../shared/mcp/tool-result';
import { findBlogs } from '../infrastructure/blog-repository';

export const registerBlogTools = (server: McpServer): void => {
  server.registerTool(
    'list_blogs',
    {
      title: 'ブログ一覧',
      description:
        'ブログ記事を公開状態・閲覧数・フィードバック件数・タグ付きで返す。status で公開済み/下書きに絞り、sort で作成日順か閲覧数順を選ぶ。',
      inputSchema: z.object({
        status: z.enum(['all', 'published', 'draft']).default('all'),
        sort: z.enum(['recent', 'views']).default('recent'),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
      outputSchema: z.object({
        total: z.number(),
        items: z.array(
          z.object({
            slug: z.string(),
            published: z.boolean(),
            createdAt: z.string(),
            views: z.number(),
            feedbackCount: z.number(),
            tags: z.array(z.string()),
          }),
        ),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => toolResult(await findBlogs(input)),
  );
};
