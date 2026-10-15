import { aiArtifactVersions } from './ai-artifact-versions';
import { aiArtifacts } from './ai-artifacts';
import {
  aiProjectVersions,
  aiProjectVersionsRelations,
} from './ai-project-versions';
import { aiProjects, aiProjectsRelations } from './ai-projects';
import {
  aiThreadMessages,
  aiThreadMessagesRelations,
} from './ai-thread-messages';
import { aiThreads, aiThreadsRelations } from './ai-threads';
import { aiUsages, aiUsagesRelations } from './ai-usages';
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from './auth-schema';

// Better Auth の drizzleAdapter は schema を渡さず db のスキーマから user などを探すので、
// 認証のテーブルもここに載せる
export const schema = {
  user,
  session,
  account,
  verification,
  aiProjects,
  aiProjectVersions,
  aiUsages,
  aiThreads,
  aiThreadMessages,
  aiArtifacts,
  aiArtifactVersions,
};

export const relations = {
  userRelations,
  sessionRelations,
  accountRelations,
  aiProjectsRelations,
  aiProjectVersionsRelations,
  aiUsagesRelations,
  aiThreadsRelations,
  aiThreadMessagesRelations,
};
