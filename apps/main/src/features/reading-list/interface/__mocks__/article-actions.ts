type ActionResult = {
  summary?: string;
  error?: string;
};

export const generateArticleSummary = (_id: number): Promise<ActionResult> =>
  Promise.resolve({
    summary: 'モック要約：この記事の要点を1〜2文で表します。',
  });
