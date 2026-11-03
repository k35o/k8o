'use client';

import { useState } from 'react';
import type { FC } from 'react';

import { replayImageError } from '@/shared/browser/replay-image-error';

import styles from './image.module.css';

// 読み込み失敗時もコンテナ（画像領域）は残し、レイアウトシフト（CLS）を避ける
export const ReadingCardImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        {!isError && (
          <img
            alt=""
            className={styles.image}
            decoding="async"
            loading="lazy"
            onError={() => {
              setIsError(true);
            }}
            ref={replayImageError}
            src={src}
          />
        )}
      </div>
    </div>
  );
};
