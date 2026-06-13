import { Suspense } from 'react';

import { RadiusMaker } from './_components/radius-maker';

export default function Page() {
  return (
    <section className="py-10">
      <Suspense>
        <RadiusMaker />
      </Suspense>
    </section>
  );
}
