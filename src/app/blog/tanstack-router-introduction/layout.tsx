import { Heading } from '@/app/_components/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  category: 'TanStackRouter',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h2">
        Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ
      </Heading>
      <article className="rounded-lg bg-white px-10 py-14 pt-4">
        {children}
      </article>
    </div>
  );
}
