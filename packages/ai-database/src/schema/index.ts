import { aiArtifactShares } from './ai-artifact-shares.ts';
import { aiArtifactVersions } from './ai-artifact-versions.ts';
import { aiArtifacts } from './ai-artifacts.ts';
import {
  aiThreadMessages,
  aiThreadMessagesRelations,
} from './ai-thread-messages.ts';
import { aiThreads, aiThreadsRelations } from './ai-threads.ts';
import { aiUsages, aiUsagesRelations } from './ai-usages.ts';
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from './auth-schema.ts';

// Better Auth の drizzleAdapter は schema を渡さず db のスキーマから user などを探すので、
// 認証のテーブルもここに載せる
export const schema = {
  user,
  session,
  account,
  verification,
  aiUsages,
  aiThreads,
  aiThreadMessages,
  aiArtifacts,
  aiArtifactVersions,
  aiArtifactShares,
};

export const relations = {
  userRelations,
  sessionRelations,
  accountRelations,
  aiUsagesRelations,
  aiThreadsRelations,
  aiThreadMessagesRelations,
};
