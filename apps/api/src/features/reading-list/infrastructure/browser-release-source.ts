import { safeFetch } from '@repo/helpers/url/safe-fetch';
import * as z from 'zod';

import type { FeedItem } from './feed-source';

const TIMEOUT_MS = 10_000;

// @mdn/browser-compat-data の browsers/<ブラウザ>.json。版ごとに公開日とリリースノートの URL を持つ
const browsersSchema = z.object({
  browsers: z.record(
    z.string(),
    z.object({
      name: z.string(),
      releases: z.record(
        z.string(),
        z.object({
          status: z.string(),
          release_date: z.optional(z.string()),
          release_notes: z.optional(z.string()),
        }),
      ),
    }),
  ),
});

// 出荷済みの版。beta・nightly・planned はまだ出ておらず、esr は同じ版の別の配り方
const SHIPPED_STATUSES = new Set(['current', 'retired']);

// ブラウザの版の一覧を、版ごとの 1 件（題は「Chrome 158」、リンクはリリースノート）にする。
// 公開日かリリースノートの無い版は出さない
export async function fetchBrowserReleaseItems(
  url: string,
): Promise<FeedItem[]> {
  // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
  const response = await safeFetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `版の一覧の取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const { browsers } = z.parse(browsersSchema, await response.json());
  return Object.values(browsers).flatMap(({ name, releases }) =>
    Object.entries(releases).flatMap(([version, release]) =>
      SHIPPED_STATUSES.has(release.status) &&
      release.release_date !== undefined &&
      release.release_notes !== undefined
        ? [
            {
              title: `${name} ${version}`,
              link: release.release_notes,
              publishedAt: release.release_date,
            },
          ]
        : [],
    ),
  );
}
