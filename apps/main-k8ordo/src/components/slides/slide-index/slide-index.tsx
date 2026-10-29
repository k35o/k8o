import type { ComponentProps, FC } from 'react';

import { SlideCard } from '../slide-card/slide-card';

import styles from './slide-index.module.css';

export const SlideIndex: FC<{
  slides: ReadonlyArray<ComponentProps<typeof SlideCard> & { id: number }>;
}> = ({ slides }) => (
  <div className={styles.root}>
    {slides.map((slide) => (
      <SlideCard key={slide.id} {...slide} />
    ))}
  </div>
);
