'use client';

import { countGraphemeLength } from '../../_utils/count-text';
import { FC, memo } from 'react';

export const TextLength: FC<{ text: string }> = memo(({ text }) => {
  const length = countGraphemeLength(text);

  return <>{length}</>;
});
