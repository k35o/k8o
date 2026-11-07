'use client';

import { useState } from 'react';
import type { FC } from 'react';

import { replayImageError } from '@/shared/browser/replay-image-error';

import styles from './image.module.css';

export const MetaImage: FC<{
  src: string;
}> = ({ src }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
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
      </div>
    </div>
  );
};
