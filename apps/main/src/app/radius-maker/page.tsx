import { Suspense } from 'react';

import { getFeatureStatus } from '@/features/browser-support/interface/queries';

import { RadiusMaker } from './_components/radius-maker';

export default async function Page() {
  const cornerShapeStatus = await getFeatureStatus('corner-shape');
  return (
    <section className="py-10">
      <Suspense>
        <RadiusMaker cornerShapeStatus={cornerShapeStatus} />
      </Suspense>
    </section>
  );
}
