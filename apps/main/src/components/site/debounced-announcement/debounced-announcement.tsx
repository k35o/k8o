'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';

import styles from './debounced-announcement.module.css';

const DELAY_MS = 500;

// 連続して変わる値の読み上げを、落ち着いてからの最新の1回にする。空文字は通知しない
export const DebouncedAnnouncement: FC<{ message: string }> = ({ message }) => {
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (message === '') {
      return;
    }
    const id = setTimeout(() => {
      setAnnouncement(message);
    }, DELAY_MS);
    return () => {
      clearTimeout(id);
    };
  }, [message]);

  return <output className={styles.srOnly}>{announcement}</output>;
};
