import { getSlideContents } from '@/features/slides/interface/queries';

import { SlideCard } from './_components/slide-card';

import styles from './page.module.css';

export default async function Page() {
  const slides = await getSlideContents();
  return (
    <div className={styles.root}>
      {slides.map((slide) => (
        <SlideCard key={slide.id} {...slide} />
      ))}
    </div>
  );
}
