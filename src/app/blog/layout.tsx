import Link from 'next/link';
import { Heading } from '../_components/heading';

export const metadata = {
  title: 'Blog',
  description: 'k8oのブログです。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/blog">
        <Heading type="h2">Blog</Heading>
      </Link>
      {children}
    </div>
  );
}
