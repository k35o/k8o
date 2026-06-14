'use client';

import type { Spec } from '@json-render/core';
import { JSONUIProvider, Renderer } from '@json-render/react';
import { registry } from '@k8o/arte-odyssey/json-render/registry';
import type { FC } from 'react';

type Props = {
  /** json-render の Spec。null のときは何も描画しない。 */
  spec: Spec | null;
  /** 生成ストリーミング中かどうか。Renderer のローディング表示に渡す。 */
  loading?: boolean;
};

/**
 * 生成された json-render Spec を arte-odyssey のコンポーネントで描画する。
 *
 * 事前結線済みの `JsonRenderUI` ではなく、低レベルの `JSONUIProvider` + `Renderer`
 * を自前で結線している。理由は `JsonRenderUI` が `spec.state` を初期 state に
 * seed しないため、`repeat` や `$item` / `$bindState` を使うデータ駆動 UI が空で
 * 描画されてしまうから。ここで `initialState={spec.state}` を明示的に渡すことで、
 * LLM が生成する state 付きの spec も正しく描画される。
 */
export const UiPreview: FC<Props> = ({ spec, loading = false }) => (
  <JSONUIProvider initialState={spec?.state ?? {}} registry={registry}>
    <Renderer loading={loading} registry={registry} spec={spec} />
  </JSONUIProvider>
);
