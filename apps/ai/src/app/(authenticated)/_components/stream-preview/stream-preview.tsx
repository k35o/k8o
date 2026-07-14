'use client';

import { useMemo } from 'react';
import type { FC } from 'react';

import { parseStreamingTsx } from '@/features/preview/application/incremental-jsx/parse-partial-jsx';

import { renderRoot } from './render-jsx-node';
import { StreamBoundary } from './stream-boundary';

type Props = {
  // 生成中の途中 TSX（studio の streamingCode をそのまま渡せる）。
  code: string | null;
};

// 生成ストリームの途中 TSX を、Sandbox/Vite を介さずホスト側で直接・逐次描画する island。
// コンパイルしないので未完入力でも壊れず、未受信の先端はスケルトンで表す。
export const StreamPreview: FC<Props> = ({ code }) => {
  const nodes = useMemo(() => {
    if (code === null || code === '') {
      return [];
    }
    try {
      return parseStreamingTsx(code);
    } catch {
      // パーサが万一 throw しても島を落とさず、空（スピナー）にフォールバックする。
      return [];
    }
  }, [code]);

  return (
    <div className="bg-bg-base text-fg-base size-full overflow-auto">
      <StreamBoundary resetKey={code?.length ?? 0}>
        {renderRoot(nodes)}
      </StreamBoundary>
    </div>
  );
};
