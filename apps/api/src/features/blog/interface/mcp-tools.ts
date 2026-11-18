import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { pageInput, pageSizeInput } from '../../../shared/mcp/pagination-input';
import { READ_ONLY_TOOL_ANNOTATIONS } from '../../../shared/mcp/read-only-annotations';
import { toolResult } from '../../../shared/mcp/tool-result';
import {
  BLOG_SORTS,
  BLOG_STATS_PAGE_SIZE_MAX,
  BLOG_STATUSES,
} from '../application/blog-stats';
import { listBlogStats } from '../application/list-blog-stats';

export const registerBlogTools = (server: McpServer): void => {
  server.registerTool(
    'list_blogs',
    {
      title: 'ブログ一覧',
      description:
        'ブログ記事を公開状態・閲覧数・フィードバック件数・タグ付きで返す。status で公開済み/下書きに絞り、sort で作成日順か閲覧数順を選ぶ。',
      inputSchema: z.object({
        status: z.enum(BLOG_STATUSES).default('all'),
        sort: z.enum(BLOG_SORTS).default('recent'),
        page: pageInput,
        pageSize: pageSizeInput(BLOG_STATS_PAGE_SIZE_MAX, 20),
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
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async (input) => toolResult(await listBlogStats(input)),
  );
};
