'use client';

import { formatDate } from '@repo/helpers/date/format';

import styles from './copyright.module.css';

export function Copyright() {
  return (
    <p className={styles.root}>
      ©︎ 2024〜{formatDate(new Date(), 'yyyy')} k8o. All Rights Reserved.
    </p>
  );
}
