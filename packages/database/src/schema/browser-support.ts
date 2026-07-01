import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// アプリ全体が動作保証するブラウザの最低バージョン。同期(sync-baseline)のたびに
// baseline_snapshots の全機能から算出して upsert する。browser はコア7ブラウザの
// キー(chrome / chrome_android / edge / firefox / firefox_android / safari / safari_ios)。
// version は該当ブラウザで全 Baseline 機能が動く最低版(未算出なら null)。
export const browserSupport = sqliteTable('browser_support', {
  browser: text('browser').primaryKey(),
  version: text('version'),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
});
