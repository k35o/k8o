import type { FC } from 'react';

import styles from './image.module.css';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
};

export const Image: FC<Props> = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
}) => (
  <figure className={styles.figure}>
    <img
      alt={alt}
      className={styles.image}
      decoding="async"
      height={height}
      loading={loading}
      src={src}
      width={width}
    />
    {alt !== '' && (
      <figcaption
        // alt と同じ文を読み上げで二重にしない
        aria-hidden
        className={styles.caption}
      >
        {alt}
      </figcaption>
    )}
  </figure>
);

export const FloatImage: FC<Props> = (props) => (
  <div className={styles.float}>
    <Image {...props} />
  </div>
);
