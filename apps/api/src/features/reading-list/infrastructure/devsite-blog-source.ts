import { safeFetch } from '@repo/helpers/url/safe-fetch';
import * as z from 'zod';

import type { FeedItem } from './feed-source';

const TIMEOUT_MS = 10_000;

// DevSite の RSS は更新されないことがあるので、ブログの一覧のページが読む非公開の API
// （/_d/dynamic_content）を使う。要求は protobuf を位置で並べた JSON で、4 番目が
// 検索の条件、9 番目が件数、13 番目が並び順（2 は新しい順）
const REQUEST_BODY = JSON.stringify([
  null,
  null,
  null,
  'type:blog',
  null,
  null,
  null,
  null,
  20,
  null,
  null,
  null,
  2,
]);

const XSSI_PREFIX = ")]}'\n";

// 応答も位置で並ぶ（題・種類・…・公開日の秒・URL）。位置が変わって別の値を記事に
// しないよう、使う位置の型を確かめて失敗にする
const entrySchema = z.tuple(
  [
    z.string(),
    z.unknown(),
    z.unknown(),
    z.unknown(),
    z.unknown(),
    z.tuple([z.number()], z.unknown()),
    z.string(),
  ],
  z.unknown(),
);
const responseSchema = z.tuple([z.array(entrySchema)], z.unknown());

export async function fetchDevsiteBlogItems(url: string): Promise<FeedItem[]> {
  // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
  const response = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json+protobuf' },
    body: REQUEST_BODY,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `ブログの一覧の取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const text = await response.text();
  const parsed = text.startsWith(XSSI_PREFIX)
    ? z.safeParse(responseSchema, JSON.parse(text.slice(XSSI_PREFIX.length)))
    : undefined;
  if (parsed?.success !== true) {
    throw new Error('ブログの一覧の応答の形が変わった', {
      cause: parsed?.error,
    });
  }
  const [entries] = parsed.data;
  return entries.map(([title, , , , , [publishedSeconds], link]) => ({
    title,
    link,
    publishedAt: new Date(publishedSeconds * 1000).toISOString(),
  }));
}
