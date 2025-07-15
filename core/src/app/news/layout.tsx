import { Heading } from '../../components/heading';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/news" className="hover:underline">
        <Heading type="h2">お知らせ</Heading>
      </Link>
      {children}
      {modal}
    </div>
  );
}
