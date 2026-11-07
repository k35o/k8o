'use client';

import type { FC } from 'react';
import { preload } from 'react-dom';

import { publicApi } from '@/shared/api/public-api';

// 一覧はハイドレーションを終えてから api で読むので、HTML を読むうちに取り始めておく。Server Component
// で書くとペイロードの hint にも入り、リンクを先読みしただけで api を読むので、描くときに書く。dev は
// ブラウザが別の api（portless）を読むので、先に取っても使われない
export const ReadingListPreload: FC = () => {
  if (import.meta.env.PROD) {
    preload(publicApi.public['reading-list'].$url().href, {
      as: 'fetch',
      crossOrigin: 'anonymous',
    });
  }
  return null;
};
