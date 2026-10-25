'use client';

import { Button } from '@k8ordo/ui';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import styles from './print-color-adjust-demo.module.css';

export const PrintColorAdjustDemo: FC = () => {
  const [isExact, setIsExact] = useState(false);

  const toggle = () => {
    const next = !isExact;
    document.body.style.printColorAdjust = next ? 'exact' : 'economy';
    setIsExact(next);
  };

  useEffect(
    () => () => {
      document.body.style.printColorAdjust = '';
    },
    [],
  );

  return (
    <div className={styles.root}>
      <p className={styles.title}>色調整の設定（print-color-adjust）</p>
      <p className={styles.note}>
        ブラウザの印刷設定で色調整を正確にするか、ブラウザにお任せするかを選択できます。
      </p>
      <p className={styles.note}>
        現在の設定: {isExact ? '正確（exact）' : 'ブラウザにお任せ（economy）'}
      </p>
      <Button onClick={toggle}>
        {isExact ? 'ブラウザにお任せする' : '正確にする'}
      </Button>
    </div>
  );
};
