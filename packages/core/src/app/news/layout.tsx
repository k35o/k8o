import { Heading } from '@k8o/arte-odyssey/heading';
import Link from 'next/link';

export default function Layout({ children, modal }: LayoutProps<'/news'>) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link className="hover:underline" href="/news">
        <Heading type="h2">お知らせ</Heading>
      </Link>
      {children}
      {modal}
    </div>
  );
}
