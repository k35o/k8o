import { Heading } from '@k8o/arte-odyssey/heading';
import type { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-md bg-bg-base p-10">
      <Heading type="h3">問題一覧</Heading>
      {children}
    </section>
  );
}
