'use client';

import { memo } from 'react';
import type { FC } from 'react';

import { countGraphemeLength } from '../count-text/count-text';

export const TextLength: FC<{ text: string }> = memo(function TextLength({
  text,
}) {
  const length = countGraphemeLength(text);

  return length;
});
