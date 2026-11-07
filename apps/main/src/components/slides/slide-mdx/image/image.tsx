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
      // 画像はほかの枚にあることが多く、印刷用の写しは画面で見えない。low にしないと、React が head で preload する
      fetchPriority="low"
      height={height}
      src={src}
      width={width}
    />
    {caption !== undefined && caption !== '' && (
      <figcaption className={styles.caption}>{caption}</figcaption>
    )}
  </figure>
);
