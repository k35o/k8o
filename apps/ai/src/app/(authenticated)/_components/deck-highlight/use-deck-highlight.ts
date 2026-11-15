'use client';

import { useMemo } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { useResolvedScheme } from '@/app/_components/resolved-scheme';
import { highlightGenerated } from '@/features/highlight/interface/actions';

// スライドのコードブロックのハイライトはアプリのテーマに合わせる（light は one-light、dark は plastic）。
// 配色が決まる前（サーバーと hydrate の描画）は null にして、無駄な取得と取り直しを避ける。関数の参照がハイライトの
// キャッシュのキーなので、テーマが変わるときだけ作り直す
export const useDeckHighlight = (): HighlightFn | null => {
  const scheme = useResolvedScheme();
  return useMemo<HighlightFn | null>(
    () =>
      scheme === null ? null : (blocks) => highlightGenerated(blocks, scheme),
    [scheme],
  );
};
