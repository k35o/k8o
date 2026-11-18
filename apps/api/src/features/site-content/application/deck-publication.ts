// Date.parse は書式に寛容で、オフセットの無い時刻をビルドする機械の時間帯で読む。
// 手元（JST）と CI（UTC）で公開の時刻がずれないよう、オフセット付きの ISO 8601 だけを受ける
const OFFSET_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/u;

// デッキの公開時刻を過ぎた slug だけを返す。時刻が無ければいつでも公開。
// 読めない時刻を公開前として扱うと、書き間違えたデッキが黙って出ないままになるので投げる
export const publishedDeckSlug = (
  talk: { slug: string | null; deckPublishedAt: string | null },
  now: Date,
): string | null => {
  if (talk.slug === null || talk.deckPublishedAt === null) {
    return talk.slug;
  }
  const publishedAt = OFFSET_DATE_TIME.test(talk.deckPublishedAt)
    ? Date.parse(talk.deckPublishedAt)
    : Number.NaN;
  if (Number.isNaN(publishedAt)) {
    throw new TypeError(
      `トーク "${talk.slug}" の deck_published_at を、オフセット付きの時刻として読めない: ${talk.deckPublishedAt}`,
    );
  }
  return publishedAt <= now.getTime() ? talk.slug : null;
};
