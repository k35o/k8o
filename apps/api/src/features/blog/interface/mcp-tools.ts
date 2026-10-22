import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { requestMainRebuild } from '../../../shared/deploy/request-main-rebuild';
import { toolError, toolResult } from '../../../shared/mcp/tool-result';
import {
  findBlogs,
  updateBlogPublishedBySlug,
} from '../infrastructure/blog-repository';

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

  server.registerTool(
    'set_blog_published',
    {
      title: 'ブログの公開状態を切り替える',
      description:
        'slug で指定したブログ記事を公開または非公開にし、GitHub Actions で main の本番の再ビルドを起こす。k8o.me の表示が変わるのは、再ビルド（数分）が終わってから。rebuildRequested が false なら再ビルドを起こせていないので、Actions の Vercel Prebuilt Deploy を app=main・target=production で手で流す。再ビルドの失敗は GitHub の通知で届く。記事の MDX が main に無い slug を公開しても表示はされない。',
      inputSchema: z.object({
        slug: z.string().min(1),
        published: z.boolean(),
      }),
      outputSchema: z.object({
        slug: z.string(),
        published: z.boolean(),
        rebuildRequested: z.boolean(),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: { 'anthropic/requiresUserInteraction': true },
    },
    async ({ slug, published }) => {
      const found = await updateBlogPublishedBySlug(slug, published);
      if (!found) {
        return toolError(`slug "${slug}" のブログは見つかりませんでした`);
      }
      const rebuildRequested = await requestMainRebuild();
      return toolResult({ slug, published, rebuildRequested });
    },
  );
};
