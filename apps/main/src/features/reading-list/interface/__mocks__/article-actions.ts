type ActionResult = {
  summary?: string;
  error?: string;
};

export const generateArticleSummary = (_id: number): Promise<ActionResult> =>
  Promise.resolve({
    summary:
      'モック要約：型安全なルーティングを提供するライブラリの入門記事。基本的な使い方から、実プロジェクトで必要になるパターンまでを具体例を交えて順を追って解説している。',
  });
