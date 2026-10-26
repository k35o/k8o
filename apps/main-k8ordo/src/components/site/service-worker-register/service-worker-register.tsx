'use client';

import { useEffect } from 'react';
import type { FC } from 'react';

// Web Push を受け取るために Service Worker (/sw.js) をサイト全体で登録する。
export const ServiceWorkerRegister: FC = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('Service Worker の登録に失敗しました:', error);
    });
  }, []);

  return null;
};
