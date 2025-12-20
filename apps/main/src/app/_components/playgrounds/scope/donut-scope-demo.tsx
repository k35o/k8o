'use client';

import { Button } from '@k8o/arte-odyssey/button';
import Image from 'next/image';
import { useState } from 'react';

/**
 * ドーナツスコープのデモ
 * スコープルートとスコープリミットを使って特定範囲内のみスタイル適用
 */
export function DonutScopeDemo() {
  const [showDonutScope, setShowDonutScope] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">ドーナツスコープ</h3>
        <Button
          color={showDonutScope ? 'primary' : 'gray'}
          onClick={() => setShowDonutScope(!showDonutScope)}
          size="sm"
        >
          @scope: {showDonutScope ? 'ON' : 'OFF'}
        </Button>
      </div>

      <style>
        {showDonutScope
          ? `
          @scope (.demo-article) to (.demo-nested-content) {
            img {
              border: 3px solid var(--cyan-500);
              border-radius: var(--radius-md);
            }
          }
        `
          : `
          .demo-article img {
            border: 3px solid var(--cyan-500);
            border-radius: var(--radius-md);
          }
        `}
      </style>

      <div className="demo-article space-y-4 rounded-lg bg-bg-mute p-4">
        <p className="text-fg-mute text-sm">
          .article内の画像（スタイル適用対象）
        </p>
        <div className="flex gap-4">
          <Image
            alt="サンプル画像1"
            className="h-20 w-24 object-cover"
            height={80}
            src="/icon.png"
            width={96}
          />
          <Image
            alt="サンプル画像2"
            className="h-20 w-24 object-cover"
            height={80}
            src="/icon.png"
            width={96}
          />
        </div>

        <div className="demo-nested-content rounded-md bg-bg-subtle p-4">
          <p className="text-fg-mute text-sm">
            .nested-content内の画像（除外される）
          </p>
          <div className="mt-2 flex gap-4">
            <Image
              alt="ネストされた画像1"
              className="h-20 w-24 object-cover"
              height={80}
              src="/icon.png"
              width={96}
            />
            <Image
              alt="ネストされた画像2"
              className="h-20 w-24 object-cover"
              height={80}
              src="/icon.png"
              width={96}
            />
          </div>
        </div>
      </div>

      <pre className="overflow-x-auto rounded-lg bg-bg-mute px-2 py-1 text-fg-mute text-xs sm:p-4 sm:text-md">
        <code>
          {showDonutScope
            ? `@scope (.article) to (.nested-content) {
  img {
    border: 3px solid var(--cyan-500);
    border-radius: var(--radius-md);
  }
}`
            : `.article img {
  border: 3px solid var(--cyan-500);
  border-radius: var(--radius-md);
}`}
        </code>
      </pre>
    </div>
  );
}
