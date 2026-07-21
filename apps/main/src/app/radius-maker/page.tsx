import { Suspense } from 'react';

import { getFeatureStatus } from '@/features/baseline/interface/queries';

import { RadiusMaker } from './_components/radius-maker';

export default function Page() {
  const cornerShapeStatus = getFeatureStatus('corner-shape');
  return (
    <section className="py-10">
      <Suspense>
        <RadiusMaker cornerShapeStatus={cornerShapeStatus} />
      </Suspense>
    </section>
  );
}
