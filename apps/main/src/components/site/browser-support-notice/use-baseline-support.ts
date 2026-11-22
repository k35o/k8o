'use client';

import { useSyncExternalStore } from 'react';

import { supportsBaseline } from '@/features/browser-support/interface/baseline-support';

const subscribe = (): (() => void) => () => {};

// dev 限定の確認用: ?browser-support-notice=force を付けると、最新ブラウザでも
// 非対応扱いにして警告の見た目を実アプリ上で確認できる。本番では無効。
export const isNoticeForced = (): boolean =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('browser-support-notice') ===
    'force';

const getClientSnapshot = (): boolean =>
  !isNoticeForced() && supportsBaseline();

const getServerSnapshot = (): boolean => true;

// サーバーで描く HTML では対応とみなし、ハイドレーションの後にブラウザで検出する。
export const useBaselineSupport = (): boolean =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
