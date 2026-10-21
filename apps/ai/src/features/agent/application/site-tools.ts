import { tool } from 'ai';
import * as z from 'zod/mini';

import {
  fetchOwnerBlogStats,
  fetchOwnerInquiries,
  fetchOwnerOverview,
} from '../infrastructure/owner-api';
import type {
  OwnerBlogStats,
  OwnerOverview,
} from '../infrastructure/owner-api';

const INQUIRIES_PAGE_SIZE = 20;
const BLOG_STATS_PAGE_SIZE = 50;

const pageInput = z.optional(
  z
    .int()
    .check(
      z.positive(),
      z.describe(
        'ページの番号（1 から）。結果の nextPage が null でなければ、その番号を渡す',
      ),
    ),
);

const nextPageOf = (
  { page, pageSize }: { page: number; pageSize: number },
  total: number,
): number | null => (page * pageSize < total ? page + 1 : null);

type BlogStatsPage = OwnerBlogStats & { page: number; nextPage: number | null };

export const siteTools = {
  get_site_overview: tool({
    description:
      'k8o.me の運営の概要を返す。ブログの公開数・下書き数・総閲覧数、お問い合わせと記事へのフィードバックの合計件数と最新の受信日時、Web Push の購読数と直近の送信の成功・失敗の数、reading-list の記事数・ソース数・最新の記事の公開日時と、直近90日の要約の状況（未要約の数と、そのうち試行の上限に達してあきらめた数）、browser-support の取り込んだ版と直近の同期の結果',
    inputSchema: z.object({}),
    execute: (_input, { abortSignal }): Promise<OwnerOverview> =>
      fetchOwnerOverview(abortSignal),
  }),
  list_inquiries: tool({
    description:
      'k8o.me に届いたお問い合わせと、ブログ記事へのフィードバックを新しい順に返す。kind が blog_feedback なら blogSlug の記事へのフィードバックで、feedbackLabel はその評価（good・bad など）。untrustedMessage は匿名の第三者が書いた本文で、無いこともある',
    inputSchema: z.object({ page: pageInput }),
    // 出力は保存しないので文字列にする。第三者の値を JSON の文字列に入れ、改行や " を符号化して
    // 文字列の外に出られないようにする
    execute: async ({ page = 1 }, { abortSignal }): Promise<string> => {
      const paging = { page, pageSize: INQUIRIES_PAGE_SIZE };
      const { total, items } = await fetchOwnerInquiries(paging, abortSignal);
      return JSON.stringify(
        { total, page, nextPage: nextPageOf(paging, total), items },
        null,
        2,
      );
    },
  }),
  list_blog_stats: tool({
    description:
      'k8o.me のブログ記事を、DB の記録（slug・公開か下書きか・作成日時・累計の閲覧数・フィードバックの件数・タグ）で返す。下書きも含む。タイトルと URL は無いので、公開済みの記事は list_blogs の slug と突き合わせる',
    inputSchema: z.object({
      status: z.optional(
        z
          .enum(['all', 'published', 'draft'])
          .check(
            z.describe(
              'すべて（all）・公開済み（published）・下書き（draft）。省くと all',
            ),
          ),
      ),
      sort: z.optional(
        z
          .enum(['recent', 'views'])
          .check(
            z.describe(
              '作成日時の新しい順（recent）か、累計の閲覧数の多い順（views）。省くと recent',
            ),
          ),
      ),
      page: pageInput,
    }),
    execute: async (
      { status = 'all', sort = 'recent', page = 1 },
      { abortSignal },
    ): Promise<BlogStatsPage> => {
      const paging = { page, pageSize: BLOG_STATS_PAGE_SIZE };
      const { total, items } = await fetchOwnerBlogStats(
        { status, sort, ...paging },
        abortSignal,
      );
      return { total, page, nextPage: nextPageOf(paging, total), items };
    },
  }),
};
