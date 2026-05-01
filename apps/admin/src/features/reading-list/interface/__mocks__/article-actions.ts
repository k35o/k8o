type ActionState = {
  error?: string;
  success?: boolean;
};

export const deleteArticle = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });

type SyncActionState = {
  error?: string;
  newArticles?: number;
  updatedArticles?: number;
  failedSources?: string[];
};

export const syncArticlesAction = (): Promise<SyncActionState> =>
  Promise.resolve({
    newArticles: 3,
    updatedArticles: 0,
    failedSources: [],
  });
