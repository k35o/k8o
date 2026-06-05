import type { ActionState } from '@/shared/actions/action-state';

export const deleteArticle = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });

export const createArticle = (
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => Promise.resolve({ success: true });

export const updateArticle = (
  _id: number,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => Promise.resolve({ success: true });

export const refetchArticleMetadata = (_id: number): Promise<ActionState> =>
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
