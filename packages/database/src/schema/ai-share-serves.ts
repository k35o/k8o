import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { AI_APPS } from './ai-projects';

// 公開共有（/s/[slug]）閲覧時の Sandbox serve/起動イベントのログ。未認証経路なので userId は持たない。
// プロセス内クールダウンでは効かないクロスインスタンスのグローバルレート制限（課金保護）の基盤で、
// 実際に serve した回数だけ1行を積む（cache/in-flight ヒットは記録しない）。
export const aiShareServes = sqliteTable(
  'ai_share_serves',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    app: text('app', { enum: AI_APPS }).notNull(),
    slug: text('slug').notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('ai_share_serves_created_at_idx').on(table.createdAt)],
);
