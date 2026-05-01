'use client';

import { Button } from '@k8o/arte-odyssey';
import Image from 'next/image';
import { useState } from 'react';

/**
 * :scopeを使ったスコープリミットのデモ
 * スコープルートの直接の子のみをリミットとして扱う
 */
export function ScopeLimitDemo() {
  const [useScopeSelector, setUseScopeSelector] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">:scopeを使ったスコープリミット</h3>
        <Button
          color={useScopeSelector ? 'primary' : 'gray'}
          onClick={() => {
            setUseScopeSelector(!useScopeSelector);
          }}
          size="sm"
        >
          {useScopeSelector ? ':scope >' : '通常'}
        </Button>
      </div>

      <style>
        {useScopeSelector
          ? `
          @scope (.demo-article-limit) to (:scope > .demo-nested-limit) {
            img {
              border: 3px solid var(--cyan-500);
              border-radius: var(--radius-md);
            }
          }
        `
          : `
          @scope (.demo-article-limit) to (.demo-nested-limit) {
            img {
              border: 3px solid var(--cyan-500);
              border-radius: var(--radius-md);
            }
          }
        `}
      </style>

      <div className="demo-article-limit bg-bg-mute space-y-4 rounded-lg p-4">
        <p className="text-fg-mute text-sm">.article（スコープルート）</p>
        <div className="flex gap-4">
          <Image
            alt="記事の画像"
            className="h-20 w-24 object-cover"
            height={80}
            src="/icon.png"
            width={96}
          />
        </div>

        <div className="demo-nested-limit bg-bg-subtle rounded-md p-4">
          <p className="text-fg-mute text-sm">
            .nested-content（直接の子 → 常に除外）
          </p>
          <div className="mt-2 flex gap-4">
            <Image
              alt="直接の子の画像"
              className="h-20 w-24 object-cover"
              height={80}
              src="/icon.png"
              width={96}
            />
          </div>
        </div>

        <div className="bg-bg-subtle rounded-md p-4">
          <p className="text-fg-mute text-sm">ラッパー要素</p>
          <div className="demo-nested-limit bg-bg-mute mt-2 rounded-md p-4">
            <p className="text-fg-mute text-sm">
              .nested-content（孫要素 → :scope &gt;の時は適用される）
            </p>
            <div className="mt-2 flex gap-4">
              <Image
                alt="孫要素の画像"
                className="h-20 w-24 object-cover"
                height={80}
                src="/icon.png"
                width={96}
              />
            </div>
          </div>
        </div>
      </div>

      <pre className="bg-bg-mute text-fg-mute sm:text-md overflow-x-auto rounded-lg px-2 py-1 text-xs sm:p-4">
        <code>
          {useScopeSelector
            ? `@scope (.article) to (:scope > .nested-content) {
  /* .nested-contentがスコープルートの直接の子の場合のみ除外 */
  img {
    border: 3px solid var(--cyan-500);
  }
}`
            : `@scope (.article) to (.nested-content) {
  /* すべての.nested-content内を除外 */
  img {
    border: 3px solid var(--cyan-500);
  }
}`}
        </code>
      </pre>
    </div>
  );
}
