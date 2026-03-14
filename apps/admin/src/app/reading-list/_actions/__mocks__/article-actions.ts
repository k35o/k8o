type ActionState = {
  error?: string;
  success?: boolean;
};

export const deleteArticle = (_id: number): Promise<ActionState> => {
  return Promise.resolve({ success: true });
};
