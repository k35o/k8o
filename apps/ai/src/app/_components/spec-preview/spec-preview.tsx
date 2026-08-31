'use client';

import type { Spec } from '@json-render/core';
import { JsonRenderUI } from '@k8ordo/ui/json-render/registry';
import type { FC } from 'react';

type SpecPreviewProps = {
  spec: Spec | null;
  loading?: boolean;
};

// 生成された spec を @k8ordo/ui の registry でその場に描画する。
// Sandbox 時代の iframe と違い同一ドキュメントなので、テーマ・フォントは
// アプリのものをそのまま継承する。空状態の分岐は呼び出し側が持つ。
export const SpecPreview: FC<SpecPreviewProps> = ({
  spec,
  loading = false,
}) => (
  <div className="h-full overflow-auto">
    <div className="mx-auto max-w-5xl p-8">
      <JsonRenderUI loading={loading} spec={spec} />
    </div>
  </div>
);
