import {
  findDigestKeysSince,
  saveDigest,
} from '../infrastructure/digest-repository';
import { writeDigest } from '../infrastructure/digest-writer';
import { findRecentArticles } from '../infrastructure/reading-list-repository';
import {
  articleKeyOf,
  digestDateOf,
  groupByDigestDate,
  normalizeDigest,
} from './digest-days';
import { readingWindowStart } from './reading-window';

// 初めて動かす回と、止まっていたあとの回に、90 日分を一度に作らない。残りは次の回が作る
const DIGEST_LIMIT = 10;
// 記事はフィードに遅れて載ることがある。直近の日だけ、記事が増えていたら作り直す
const REWRITE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DigestResult = {
  writtenDigests: number;
  failedDigests: number;
  digestAborted: boolean;
};

export async function generateDigests(
  nowMs: number,
  deadline: number,
): Promise<DigestResult> {
  const since = readingWindowStart(nowMs).toISOString();
  const [articles, existing] = await Promise.all([
    findRecentArticles(since),
    findDigestKeysSince(digestDateOf(since)),
  ]);
  const keyByDate = new Map(
    existing.map(({ date, articleKey }) => [date, articleKey]),
  );
  // その日の記事を取り込み終える前に作ると、途中の形が RSS に配られる。終わった日だけを作る
  const today = digestDateOf(new Date(nowMs).toISOString());
  const rewriteSince = digestDateOf(
    new Date(nowMs - REWRITE_DAYS * DAY_MS).toISOString(),
  );

  const targets = groupByDigestDate(articles)
    .filter(({ date, articles: dayArticles }) => {
      if (date >= today) {
        return false;
      }
      const key = keyByDate.get(date);
      if (key === undefined) {
        return true;
      }
      return (
        date >= rewriteSince &&
        key !== articleKeyOf(dayArticles.map(({ id }) => id))
      );
    })
    .slice(0, DIGEST_LIMIT);

  const result: DigestResult = {
    writtenDigests: 0,
    failedDigests: 0,
    digestAborted: false,
  };
  for (const { date, articles: dayArticles } of targets) {
    if (Date.now() >= deadline) {
      break;
    }
    const articleIds = dayArticles.map(({ id }) => id);
    try {
      const outcome = await writeDigest(
        dayArticles.map((article) => ({
          id: article.id,
          title: article.title,
          sourceTitle: article.source.title,
          text: article.summary ?? article.description,
        })),
      );
      const digest =
        outcome.kind === 'written'
          ? normalizeDigest(outcome.digest, articleIds)
          : null;
      if (digest === null) {
        console.warn(
          `${date} のまとめを作れませんでした: ${outcome.kind === 'failed' ? outcome.reason : '使える形にならなかった'}`,
        );
        result.failedDigests += 1;
        continue;
      }
      await saveDigest({
        date,
        ...digest,
        articleKey: articleKeyOf(articleIds),
      });
      result.writtenDigests += 1;
    } catch (error) {
      // 鍵の不備・支出上限・API や DB の障害はその日のせいではないので、この回の生成をやめる
      console.error('日ごとのまとめの生成を中断しました:', error);
      result.digestAborted = true;
      break;
    }
  }
  return result;
}
