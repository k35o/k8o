import type { FC } from 'react';

import styles from './image.module.css';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export const Image: FC<Props> = ({ src, alt, width, height, caption }) => (
  <figure className={styles.root}>
    <img
      alt={alt}
      className={styles.image}
      height={height}
      src={src}
      width={width}
    />
    {caption !== undefined && caption !== '' && (
      <figcaption className={styles.caption}>{caption}</figcaption>
    )}
  </figure>
);
