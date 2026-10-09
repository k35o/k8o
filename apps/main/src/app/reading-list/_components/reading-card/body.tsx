import type { FC } from 'react';

import { ReadingCardSummary } from './summary';

export const ReadingCardBody: FC<{
  description: string | null;
  summary: string | null;
}> = ({ description, summary }) => {
  if (summary !== null) {
    return <ReadingCardSummary summary={summary} />;
  }

  return description === null ? null : (
    <p className="text-fg-mute text-sm">{description}</p>
  );
};
