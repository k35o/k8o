import { Suspense } from 'react';

import { getFeatureStatus } from '@/features/browser-support/interface/queries';

import { RadiusMaker } from './_components/radius-maker';

import styles from './page.module.css';

export default async function Page() {
  const cornerShapeStatus = await getFeatureStatus('corner-shape');
  return (
    <section className={styles.root}>
      <Suspense>
        <RadiusMaker cornerShapeStatus={cornerShapeStatus} />
      </Suspense>
    </section>
  );
}
