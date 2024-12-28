import Link from 'next/link';
import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/news" className="hover:underline">
        <Heading type="h2">お知らせ</Heading>
      </Link>
      {children}
    </div>
  );
}
