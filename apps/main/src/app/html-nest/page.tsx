import { Suspense } from 'react';

import { HtmlNest } from './_components/html-nest';

import styles from './page.module.css';

export default function Page() {
  return (
    <section className={styles.root}>
      <Suspense>
        <HtmlNest />
      </Suspense>
    </section>
  );
}
