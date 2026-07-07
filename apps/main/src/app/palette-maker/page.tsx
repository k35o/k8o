import { Suspense } from 'react';

import { PaletteMaker } from './_components/palette-maker';

export default function Page() {
  return (
    <section className="py-10">
      <Suspense>
        <PaletteMaker />
      </Suspense>
    </section>
  );
}
