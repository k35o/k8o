'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { highlightGenerated } from '@/features/highlight/interface/actions';

// スライドのコードブロックのハイライトはアプリのテーマに合わせる（light は one-light、dark は plastic）。
// テーマ解決前（SSR直後）は null にして、無駄な取得と取り直しを避ける。関数の参照がハイライトの
// キャッシュのキーなので、テーマが変わるときだけ作り直す
export const useDeckHighlight = (): HighlightFn | null => {
  const { resolvedTheme } = useTheme();
  return useMemo<HighlightFn | null>(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return null;
    }
    const theme = resolvedTheme;
    return (blocks) => highlightGenerated(blocks, theme);
  }, [resolvedTheme]);
};
