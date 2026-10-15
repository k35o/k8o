import { range } from '@repo/helpers/array/range';

import { ReadingCardSkeleton } from './_components/reading-card';

import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.filter}>
          <div className={styles.filterStack}>
            <div className={styles.filterHeading} />
            <div className={styles.filterInput} />
            <div className={styles.filterInput} />
            <div className={styles.filterInput} />
            <div className={styles.filterSeparator} />
            {range(0, 5).map((n) => (
              <div className={styles.filterTag} key={`tag-skeleton-${n}`} />
            ))}
          </div>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.count} />
          <div className={styles.button} />
        </div>
        <div className={styles.list}>
          {range(0, 8).map((n) => (
            <ReadingCardSkeleton key={`reading-card-skeleton-${n}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
