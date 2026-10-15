import NextImage from 'next/image';
import type { ComponentProps, FC } from 'react';

import styles from './image.module.css';

type Props = Omit<ComponentProps<typeof NextImage>, 'className'>;

export const Image: FC<Props> = (props) => (
  <figure className={styles.figure}>
    <NextImage className={styles.image} {...props} />
    {props.alt !== '' && (
      <figcaption
        // alt と同じ文を読み上げで二重にしない
        aria-hidden
        className={styles.caption}
      >
        {props.alt}
      </figcaption>
    )}
  </figure>
);

export const FloatImage: FC<Props> = (props) => (
  <div className={styles.float}>
    <Image {...props} />
  </div>
);
