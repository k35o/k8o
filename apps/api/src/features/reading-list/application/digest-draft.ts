import type {
  ReadingDigestPick,
  ReadingDigestTopic,
} from '@repo/database/schema';

export type DigestDraft = {
  overview: string;
  picks: ReadingDigestPick[];
  topics: ReadingDigestTopic[];
};

// まとめを作ったときの、その日の記事の集まりを表す値。あとから記事が増えた日を見分ける
export const articleKeyOf = (articleIds: readonly number[]): string =>
  articleIds.toSorted((a, b) => a - b).join(',');

const MAX_OVERVIEW_CHARS = 300;
const MAX_REASON_CHARS = 160;
const MAX_HEADLINE_CHARS = 120;
const MAX_PICKS = 3;

const oneLine = (text: string): string => text.replaceAll(/\s+/gu, ' ').trim();

// 生成したまとめを、その日の記事を 1 回ずつ指す形に整える。その日に無い id と、先に取られた id は
// 捨てる。どこにも入らなかった記事は、読むときに残りの話題にまとめる。全体像が使えないときと、指す
// 記事が 1 つも残らないときは null
export const normalizeDigest = (
  draft: DigestDraft,
  dayArticleIds: readonly number[],
): DigestDraft | null => {
  const overview = oneLine(draft.overview);
  if (overview === '' || overview.length > MAX_OVERVIEW_CHARS) {
    return null;
  }

  const remaining = new Set(dayArticleIds);
  const picks: ReadingDigestPick[] = [];
  for (const pick of draft.picks) {
    const reason = oneLine(pick.reason);
    if (
      picks.length < MAX_PICKS &&
      reason !== '' &&
      reason.length <= MAX_REASON_CHARS &&
      remaining.delete(pick.articleId)
    ) {
      picks.push({ articleId: pick.articleId, reason });
    }
  }

  const topics: ReadingDigestTopic[] = [];
  for (const topic of draft.topics) {
    const headline = oneLine(topic.headline);
    if (headline === '' || headline.length > MAX_HEADLINE_CHARS) {
      continue;
    }
    const articleIds = topic.articleIds.filter((id) => remaining.delete(id));
    if (articleIds.length > 0) {
      topics.push({ kind: topic.kind, headline, articleIds });
    }
  }
  return picks.length === 0 && topics.length === 0
    ? null
    : { overview, picks, topics };
};
