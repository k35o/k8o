'use client';

import { Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

import styles from './scope-limit-demo.module.css';

export function ScopeLimitDemo() {
  const [useScopeSelector, setUseScopeSelector] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>:scopeを使ったスコープリミット</h3>
        <Button
          color={useScopeSelector ? 'primary' : 'base'}
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

      <div className={cn('demo-article-limit', styles.article)}>
        <p className={styles.caption}>.article（スコープルート）</p>
        <div className={styles.images}>
          <img
            alt="記事の画像"
            className={styles.image}
            decoding="async"
            height={80}
            loading="lazy"
            src="/icon.png"
            width={96}
          />
        </div>

        <div className={cn('demo-nested-limit', styles.nested)}>
          <p className={styles.caption}>
            .nested-content（直接の子 → 常に除外）
          </p>
          <div className={styles.nestedImages}>
            <img
              alt="直接の子の画像"
              className={styles.image}
              decoding="async"
              height={80}
              loading="lazy"
              src="/icon.png"
              width={96}
            />
          </div>
        </div>

        <div className={styles.nested}>
          <p className={styles.caption}>ラッパー要素</p>
          <div className={cn('demo-nested-limit', styles.grandchild)}>
            <p className={styles.caption}>
              .nested-content（孫要素 → :scope &gt;の時は適用される）
            </p>
            <div className={styles.nestedImages}>
              <img
                alt="孫要素の画像"
                className={styles.image}
                decoding="async"
                height={80}
                loading="lazy"
                src="/icon.png"
                width={96}
              />
            </div>
          </div>
        </div>
      </div>

      <pre className={styles.code}>
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
