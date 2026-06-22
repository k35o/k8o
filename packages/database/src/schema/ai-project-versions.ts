/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { aiProjects } from './ai-projects';

// プロジェクトの「版」。履歴・undo・分岐の単位。content はアプリ非依存の JSON ペイロード
// （ui-studio は { code: string, meta: {...} }、別の AI 機能は別の形を入れてよい）。
export const aiProjectVersions = sqliteTable(
  'ai_project_versions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id')
      .notNull()
      .references(() => aiProjects.id, { onDelete: 'cascade' }),
    // 派生元の version ID（分岐系譜）。論理参照。
    parentId: integer('parent_id'),
    content: text('content', { mode: 'json' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('ai_project_versions_project_id_idx').on(table.projectId)],
);

export const aiProjectVersionsRelations = relations(
  aiProjectVersions,
  ({ one }) => ({
    project: one(aiProjects, {
      fields: [aiProjectVersions.projectId],
      references: [aiProjects.id],
    }),
  }),
);
