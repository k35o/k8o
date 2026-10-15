import { Suspense } from 'react';

import { PaletteMaker } from './_components/palette-maker';

import styles from './page.module.css';

export default function Page() {
  return (
    <section className={styles.root}>
      <Suspense>
        <PaletteMaker />
      </Suspense>
    </section>
  );
}
