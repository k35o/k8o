'use client';

import type { FC } from 'react';
import { preload } from 'react-dom';

import { publicApi } from '@/shared/api/public-api';

// Readings と Baseline の動きはハイドレーションを終えてから api で読むので、HTML を読むうちに取り
// 始めておく。理由と dev で書かない理由は ReadingListPreload と同じ
export const HomeDailyPreload: FC = () => {
  if (import.meta.env.PROD) {
    for (const url of [
      publicApi.public['reading-list'].latest.$url(),
      publicApi.public['browser-support']['recent-changes'].$url(),
    ]) {
      preload(url.href, { as: 'fetch', crossOrigin: 'anonymous' });
    }
  }
  return null;
};
