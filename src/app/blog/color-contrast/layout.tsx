import { Heading } from '@/app/_components/heading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  category: 'color contrast',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h2">
        色のコントラスト比は重要だけどどうやって求めるんだっけ？
      </Heading>
      <article className="rounded-lg bg-white px-1 py-14 pt-4 sm:px-10">
        {children}
      </article>
    </div>
  );
}
