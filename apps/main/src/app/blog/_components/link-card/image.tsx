'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FC } from 'react';

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
      </div>
    </div>
  );
};
