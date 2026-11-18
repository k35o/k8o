'use client';

import { useState } from 'react';
import type { FC } from 'react';

import { replayImageError } from '@/shared/browser/replay-image-error';

import styles from './meta-image.module.css';

export const MetaImage: FC<{
  src: string;
  // 読み込みに失敗しても画像の領域を残し、並ぶカードのレイアウトシフト（CLS）を避ける
  keepFrameOnError?: boolean;
}> = ({ src, keepFrameOnError = false }) => {
  const [isError, setIsError] = useState(false);
  if (isError && !keepFrameOnError) {
    return null;
  }

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
