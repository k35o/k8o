'use client';

import { useEffect } from 'react';
import type { FC } from 'react';

import { publicApi } from '@/shared/api/public-api';

export const ViewReporter: FC<{ slug: string }> = ({ slug }) => {
  useEffect(() => {
    // ページ遷移中でも中断されにくいよう keepalive を付ける
    void publicApi.public.blogs[':slug'].views
      .$post({ param: { slug } }, { init: { keepalive: true } })
      .catch(() => {
        // 計測の失敗は致命的ではないため握りつぶす
      });
  }, [slug]);

  return null;
};
