import { tool } from 'ai';
import * as z from 'zod/mini';

import {
  fetchOwnerInquiries,
  fetchOwnerOverview,
} from '../infrastructure/owner-api';
import type { OwnerOverview } from '../infrastructure/owner-api';

const INQUIRIES_PAGE_SIZE = 20;

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
};
