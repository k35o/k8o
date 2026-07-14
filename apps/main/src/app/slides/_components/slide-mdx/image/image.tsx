import NextImage from 'next/image';
import type { StaticImageData } from 'next/image';
import type { FC } from 'react';

import styles from './image.module.css';

type Props = {
  src: StaticImageData;
  alt: string;
  caption?: string;
};

export const Image: FC<Props> = ({ src, alt, caption }) => (
  <figure className={styles['figure']}>
    <NextImage
      alt={alt}
      className={styles['img']}
      loading="eager"
      priority
      src={src}
    />
    {caption !== undefined && caption !== '' && (
      <figcaption className={styles['caption']}>{caption}</figcaption>
    )}
  </figure>
);
