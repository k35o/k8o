import { safeFetch } from '@repo/helpers/url/safe-fetch';
import Parser from 'rss-parser';

import type { FeedItem } from './feed-source';

const TIMEOUT_MS = 10_000;
const DEFAULT_TAG_PREFIX = 'v';

const parser = new Parser();

const escapeRegExp = (text: string): string =>
  text.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

type Release = {
  major: number;
  minor: number;
  patch: number;
  link: string;
  publishedAt: string;
};

/**
 * GitHub のリリース（`releases.atom`）から、最新のメジャーの系統のマイナー以上の版を記事にする。
 * タグの頭は既定で `v` で、違うリポジトリは URL のフラグメントで指定する（`…/releases.atom#oxlint_v`）
 */
export async function fetchGithubReleaseItems(
  url: string,
  libraryName: string,
): Promise<FeedItem[]> {
  const { hash } = new URL(url);
  const tagPrefix = hash === '' ? DEFAULT_TAG_PREFIX : hash.slice(1);
  const tagPattern = new RegExp(
    `^${escapeRegExp(tagPrefix)}(\\d+)\\.(\\d+)\\.(\\d+)$`,
    'u',
  );

  // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
  const response = await safeFetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `リリースの一覧の取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const feed = await parser.parseString(await response.text());

  const releases = feed.items.flatMap((item): Release[] => {
    if (item.link === undefined || item.isoDate === undefined) {
      return [];
    }
    const tag = decodeURIComponent(item.link.split('/releases/tag/')[1] ?? '');
    const version = tagPattern.exec(tag);
    if (version === null) {
      return [];
    }
    const [, major, minor, patch] = version.map(Number);
    if (major === undefined || minor === undefined || patch === undefined) {
      return [];
    }
    return [
      { major, minor, patch, link: item.link, publishedAt: item.isoDate },
    ];
  });

  const latestMajor = Math.max(...releases.map(({ major }) => major));
  return releases
    .filter(({ major, patch }) => major === latestMajor && patch === 0)
    .map(({ major, minor, link, publishedAt }) => ({
      title: `${libraryName} ${major}.${minor}`,
      link,
      publishedAt,
    }));
}
