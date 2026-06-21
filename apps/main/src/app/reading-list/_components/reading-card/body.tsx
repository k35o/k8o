import type { FC } from 'react';

import { ReadingCardSummary } from './summary';
import { ReadingCardSummaryOnView } from './summary-on-view';

export const ReadingCardBody: FC<{
  articleId: number;
  description: string | null;
  summary: string | null;
}> = ({ articleId, description, summary }) => {
  // 要約済みは SSR で全文＋ラベルを表示する。未要約は表示されたタイミングで
  // クライアントから生成する（必要な所だけをクライアント島に閉じ込める）
  if (summary !== null) {
    return <ReadingCardSummary summary={summary} />;
  }

  return (
    <ReadingCardSummaryOnView articleId={articleId} description={description} />
  );
};
