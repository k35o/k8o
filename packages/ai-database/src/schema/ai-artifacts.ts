import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user } from './auth-schema';

const AI_ARTIFACT_KINDS = ['ui'] as const;
export type AiArtifactKind = (typeof AI_ARTIFACT_KINDS)[number];

export const aiArtifacts = sqliteTable('ai_artifacts', {
  // Claude が tool の入力に写すので、採番せず短い文字列をアプリ側で決める
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  kind: text('kind', { enum: AI_ARTIFACT_KINDS }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
