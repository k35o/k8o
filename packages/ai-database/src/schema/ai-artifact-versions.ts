import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { aiArtifacts } from './ai-artifacts';
import { aiThreads } from './ai-threads';

export const aiArtifactVersions = sqliteTable(
  'ai_artifact_versions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artifactId: text('artifact_id')
      .notNull()
      .references(() => aiArtifacts.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    // 土台にした版の id。ほかの生成物の版から分かれることもあるので、FK を張らない論理参照にする
    parentId: integer('parent_id'),
    // 会話の外で版を作ることもあるので、null を許す
    threadId: text('thread_id').references(() => aiThreads.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    instruction: text('instruction').notNull(),
    summary: text('summary').notNull(),
    content: text('content', { mode: 'json' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('ai_artifact_versions_artifact_version_idx').on(
      table.artifactId,
      table.version,
    ),
  ],
);
