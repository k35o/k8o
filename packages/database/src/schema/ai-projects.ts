/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { aiProjectVersions } from './ai-project-versions';
import { user } from './auth-schema';

// AI アプリ群で共有する識別子。新しい AI 機能を足すたびにここへ追加する。
export const AI_APPS = ['ui-studio', 'slides'] as const;
export type AiApp = (typeof AI_APPS)[number];

export const AI_VISIBILITIES = ['private', 'public'] as const;
export type AiVisibility = (typeof AI_VISIBILITIES)[number];

// app 判別子で複数の AI アプリが同じテーブルに相乗りする。
export const aiProjects = sqliteTable(
  'ai_projects',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    app: text('app', { enum: AI_APPS }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    // 公開リンク用の一意キー（/s/[slug]）。
    slug: text('slug').notNull(),
    visibility: text('visibility', { enum: AI_VISIBILITIES })
      .notNull()
      .default('private'),
    // フォーク元プロジェクトID。論理参照（自己参照 FK は張らず、削除整合はアプリ側で扱う）。
    forkOf: integer('fork_of'),
    // 公開中の version ID（論理参照）。
    publishedVersionId: integer('published_version_id'),
    // 公開時に一度だけレンダリングした静的 HTML。/s/[slug] はこれを配信し、毎回サンドボックスを叩かない。
    publicSnapshot: text('public_snapshot'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('ai_projects_slug_idx').on(table.slug),
    index('ai_projects_user_id_idx').on(table.userId),
    index('ai_projects_app_idx').on(table.app),
  ],
);

export const aiProjectsRelations = relations(aiProjects, ({ one, many }) => ({
  user: one(user, {
    fields: [aiProjects.userId],
    references: [user.id],
  }),
  versions: many(aiProjectVersions),
}));
