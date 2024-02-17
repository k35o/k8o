import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  category: 'color contrast',
  openGraph: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    description:
      '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    url: 'https://k8o.vercel.app/blog/color-contrast',
  },
  twitter: {
    title: '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
    card: 'summary',
    description:
      '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
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
