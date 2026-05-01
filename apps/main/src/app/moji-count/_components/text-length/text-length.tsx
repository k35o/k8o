'use client';

import { type FC, memo } from 'react';

import { countGraphemeLength } from '../../_utils/count-text';

export const TextLength: FC<{ text: string }> = memo(function TextLength({
  text,
}) {
  const length = countGraphemeLength(text);

  return length;
});
