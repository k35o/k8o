'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FC } from 'react';

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
          <Image
            alt=""
            className={styles.image}
            fill
            onError={() => {
              setIsError(true);
            }}
            sizes="(min-width: 640px) 192px, 100vw"
            src={src}
            unoptimized
          />
        )}
      </div>
    </div>
  );
};
