'use client';

import { FC, memo } from 'react';
import { countGraphemeLength } from '../../_utils/countText';

export const TextLength: FC<{ text: string }> = memo(({ text }) => {
  const length = countGraphemeLength(text);

  return <>{length}</>;
});

if (process.env.NODE_ENV !== 'production') {
  TextLength.displayName = 'TextLength';
}
