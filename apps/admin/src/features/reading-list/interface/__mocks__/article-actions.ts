import type { ActionState } from '@/shared/actions/action-state';

export const deleteArticle = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });

type SyncActionState = ActionState & {
  newArticles?: number;
  updatedArticles?: number;
  enrichedArticles?: number;
  failedSources?: string[];
};

export const syncArticlesAction = (): Promise<SyncActionState> =>
  Promise.resolve({
    newArticles: 3,
    updatedArticles: 0,
    enrichedArticles: 0,
    failedSources: [],
  });
