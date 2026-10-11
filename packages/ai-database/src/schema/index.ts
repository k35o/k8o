import {
  aiProjectVersions,
  aiProjectVersionsRelations,
} from './ai-project-versions';
import { aiProjects, aiProjectsRelations } from './ai-projects';
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
};

export const relations = {
  userRelations,
  sessionRelations,
  accountRelations,
  aiProjectsRelations,
  aiProjectVersionsRelations,
  aiUsagesRelations,
};
