import { Suspense } from 'react';

import { HtmlNest } from './_components/html-nest';

export default function Page() {
  return (
    <section className="py-10">
      <Suspense>
        <HtmlNest />
      </Suspense>
    </section>
  );
}
