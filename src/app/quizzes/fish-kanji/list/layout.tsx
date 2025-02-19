import { PropsWithChildren } from 'react';
import { Heading } from '@/components/heading';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <section className="bg-bg-base flex h-full flex-col gap-4 rounded-md p-10">
      <Heading type="h3">問題一覧</Heading>
      {children}
    </section>
  );
}
