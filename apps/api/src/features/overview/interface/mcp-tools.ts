import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { toolResult } from '../../../shared/mcp/tool-result';
import { getSummaryProgress } from '../../reading-list/interface/queries';
import { findOverview } from '../infrastructure/overview-repository';

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
          latestAt: z.string().nullable(),
        }),
        push: z.object({
          subscribers: z.number(),
          lastSentAt: z.string().nullable(),
          lastSucceeded: z.number().nullable(),
          lastFailed: z.number().nullable(),
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
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const [overview, summaryProgress] = await Promise.all([
        findOverview(),
        getSummaryProgress(),
      ]);
      return toolResult({
        ...overview,
        readingList: { ...overview.readingList, ...summaryProgress },
      });
    },
  );
};
