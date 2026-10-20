import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { aiArtifactVersions } from './ai-artifact-versions';
import { aiArtifacts } from './ai-artifacts';

export const aiArtifactShares = sqliteTable('ai_artifact_shares', {
  artifactId: text('artifact_id')
    .primaryKey()
    .references(() => aiArtifacts.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  // 版の行は書き換えないので、公開する版を変えるときはこの列だけを書き換える
  versionId: integer('version_id')
    .notNull()
    .references(() => aiArtifactVersions.id, { onDelete: 'cascade' }),
});
