import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// 話題の性質
export const READING_DIGEST_KINDS = [
  'release',
  'explainer',
  'opinion',
  'report',
  'announcement',
  'security',
] as const;

export type ReadingDigestKind = (typeof READING_DIGEST_KINDS)[number];

// 特に見てほしい記事（articles.id）と、その理由
export type ReadingDigestPick = {
  articleId: number;
  reason: string;
};

// 1 日の記事を束ねた話題。articleIds はその話題に入る記事（articles.id）
export type ReadingDigestTopic = {
  kind: ReadingDigestKind;
  headline: string;
  articleIds: number[];
};

// reading-list の、日ごとのまとめ。1 日 1 行で、その日の全体像と、特に見てほしい記事と、
// 記事を束ねた話題を持つ。記事は picks か topics の 1 か所にだけ入り、どこにも入らない記事は読むときに
// 残りの記事として返す
export const readingDigests = sqliteTable('reading_digests', {
  // 日本時間の YYYY-MM-DD
  date: text('date').primaryKey(),
  overview: text('overview').notNull(),
  picks: text('picks', { mode: 'json' }).$type<ReadingDigestPick[]>().notNull(),
  topics: text('topics', { mode: 'json' })
    .$type<ReadingDigestTopic[]>()
    .notNull(),
  // まとめを作ったときの、その日の記事の id（昇順のカンマ区切り）。あとから記事が増えた日を見分ける
  articleKey: text('article_key').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
});
