'use client';

import { formatDate } from '@repo/helpers/date/format';
import { use } from 'react';
import { browser } from 'react-dom';

import styles from './copyright.module.css';

const currentYear = (): string => formatDate(new Date(), 'yyyy');

export function Copyright() {
  use(browser('ビルドの年で固めず、見ている時点の年を出す'));

  return (
    <p className={styles.root}>
      ©︎ 2024〜{currentYear()} k8o. All Rights Reserved.
    </p>
  );
}
