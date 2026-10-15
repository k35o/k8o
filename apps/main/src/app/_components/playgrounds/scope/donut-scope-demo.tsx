'use client';

import { Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import Image from 'next/image';
import { useState } from 'react';

import styles from './donut-scope-demo.module.css';

export function DonutScopeDemo() {
  const [showDonutScope, setShowDonutScope] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>ドーナツスコープ</h3>
        <Button
          color={showDonutScope ? 'primary' : 'base'}
          onClick={() => {
            setShowDonutScope(!showDonutScope);
          }}
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

      <div className={cn('demo-article', styles.article)}>
        <p className={styles.caption}>.article内の画像（スタイル適用対象）</p>
        <div className={styles.images}>
          <Image
            alt="サンプル画像1"
            className={styles.image}
            height={80}
            src="/icon.png"
            width={96}
          />
          <Image
            alt="サンプル画像2"
            className={styles.image}
            height={80}
            src="/icon.png"
            width={96}
          />
        </div>

        <div className={cn('demo-nested-content', styles.nested)}>
          <p className={styles.caption}>
            .nested-content内の画像（除外される）
          </p>
          <div className={styles.nestedImages}>
            <Image
              alt="ネストされた画像1"
              className={styles.image}
              height={80}
              src="/icon.png"
              width={96}
            />
            <Image
              alt="ネストされた画像2"
              className={styles.image}
              height={80}
              src="/icon.png"
              width={96}
            />
          </div>
        </div>
      </div>

      <pre className={styles.code}>
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
