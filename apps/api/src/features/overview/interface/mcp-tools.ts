import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { READ_ONLY_TOOL_ANNOTATIONS } from '../../../shared/mcp/read-only-annotations';
import { toolResult } from '../../../shared/mcp/tool-result';
import { getOverview } from '../application/get-overview';

export const registerOverviewTools = (server: McpServer): void => {
  server.registerTool(
    'get_overview',
    {
      title: 'k8o の概要',
      description:
        'ブログの公開数と総閲覧数、お問い合わせとブログへのフィードバックの合計件数と最新の受信日時、Web Push の購読数と直近の送信結果、reading-list の記事数とソース数と直近90日の要約の状況（未要約の数と、そのうち試行の上限に達してあきらめた数）、browser-support の取り込み状況をまとめて返す。',
      inputSchema: z.object({}),
      outputSchema: z.object({
        blogs: z.object({
          published: z.number(),
          drafts: z.number(),
          totalViews: z.number(),
        }),
        inquiries: z.object({
          total: z.number(),
          latestReceivedAt: z.string().nullable(),
        }),
        push: z.object({
          subscribers: z.number(),
          lastSend: z
            .object({
              sentAt: z.string(),
              succeeded: z.number(),
              failed: z.number(),
            })
            .nullable(),
        }),
        readingList: z.object({
          articles: z.number(),
          sources: z.number(),
          latestPublishedAt: z.string().nullable(),
          unsummarized: z.number(),
          summaryGaveUp: z.number(),
        }),
        browserSupport: z.object({
          activeVersion: z.string().nullable(),
          activeIngestedAt: z.string().nullable(),
          lastRun: z
            .object({
              result: z.string(),
              trigger: z.string(),
              createdAt: z.string(),
            })
            .nullable(),
        }),
      }),
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async () => toolResult(await getOverview()),
  );
};
