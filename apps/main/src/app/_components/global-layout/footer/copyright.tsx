'use client';

import { formatDate } from '@repo/helpers/date/format';

import styles from './copyright.module.css';

// 描画時に現在の年を読む。Cache Components の prerender に乗らないよう、
// footer.tsx で Suspense に包んでいる
const currentYear = (): string => formatDate(new Date(), 'yyyy');

export function Copyright() {
  return (
    <p className={styles.root}>
      ©︎ 2024〜{currentYear()} k8o. All Rights Reserved.
    </p>
  );
}
