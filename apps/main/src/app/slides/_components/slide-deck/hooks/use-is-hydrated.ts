'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * クライアントでハイドレートが完了したかを示す。
 *
 * SSR で生成された HTML はブラウザが先に paint してしまうため、
 * URL `#5` で来訪しても初回 paint には index=0 (スライド 1) が映る。
 * その後 React がハイドレートして `useHashSync` が index を 4 に書き換えても、
 * 一瞬スライド 1 が見えるフラッシュが残る。
 *
 * この hook は paint 前 (`useLayoutEffect`) で true になるので、
 * 「ハイドレート前は空ステージ、ハイドレート後に正しいスライドを描画」
 * という出し分けで SSR 由来のフラッシュを抑止できる。
 */
export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);
  useBrowserLayoutEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
};
