import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  description:
    'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  category: 'color contrast',
  openGraph: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
    url: 'https://k8o.vercel.app/blog/color-contrast',
  },
  twitter: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    card: 'summary',
    description:
      'React で開発する時、どのようにルーティングを実装していますか？Next.jsやRemixなどのフレームワークを用いて開発するときはフレームワークに実装されたルーティング利用し、フレームワークを利',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-lg bg-white px-1 py-14 pt-4 sm:px-10">
        {children}
      </article>
    </div>
  );
}
