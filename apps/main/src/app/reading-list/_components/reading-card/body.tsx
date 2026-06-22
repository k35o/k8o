import type { FC } from 'react';

import { ReadingCardSummary } from './summary';
import { ReadingCardSummaryOnView } from './summary-on-view';

export const ReadingCardBody: FC<{
  articleId: number;
  description: string | null;
  summary: string | null;
  summaryGaveUp: boolean;
}> = ({ articleId, description, summary, summaryGaveUp }) => {
  // 要約済みは SSR で全文＋ラベルを表示する。未要約は表示されたタイミングで
  // クライアントから生成する（必要な所だけをクライアント島に閉じ込める）
  if (summary !== null) {
    return <ReadingCardSummary summary={summary} />;
  }

  // 上限まで生成に失敗した記事は再生成せず、元記事の説明文のまま確定表示する
  // （「生成中…」を繰り返して決着しないのを防ぐ）
  if (summaryGaveUp) {
    return description === null ? null : (
      <p className="text-fg-mute text-sm">{description}</p>
    );
  }

  return (
    <ReadingCardSummaryOnView articleId={articleId} description={description} />
  );
};
