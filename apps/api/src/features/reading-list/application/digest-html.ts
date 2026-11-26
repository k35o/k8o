import type { ReadingDay } from './reading-days';

const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const topicLines = (
  day: ReadingDay,
): Array<{ headline: string; count: number }> => [
  ...day.topics.map(({ headline, articles }) => ({
    headline,
    count: articles.length,
  })),
  ...(day.remainingArticles.length === 0
    ? []
    : [
        {
          headline:
            day.picks.length === 0 && day.topics.length === 0
              ? 'この日の記事'
              : 'そのほかの記事',
          count: day.remainingArticles.length,
        },
      ]),
];

// RSS のリーダーは description を HTML として描く。記事の題やまとめの文は外から来るので、HTML の字に
// してから入れる
export const digestHtml = (overview: string, day: ReadingDay): string => {
  const topics = topicLines(day);
  return [
    `<p>${escapeHtml(overview)}</p>`,
    ...(day.picks.length === 0
      ? []
      : [
          '<h3>見てほしい記事</h3><ul>',
          ...day.picks.map(
            ({ article, reason }) =>
              `<li><a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a>（${escapeHtml(article.sourceTitle)}）<br>${escapeHtml(reason)}</li>`,
          ),
          '</ul>',
        ]),
    ...(topics.length === 0
      ? []
      : [
          '<h3>話題</h3><ul>',
          ...topics.map(
            ({ headline, count }) =>
              `<li>${escapeHtml(headline)}（${count}件）</li>`,
          ),
          '</ul>',
        ]),
    '<p>まとめはClaudeが書いています。</p>',
  ].join('');
};
