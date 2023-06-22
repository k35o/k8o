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
      <link
        rel="stylesheet"
        href="https://unpkg.com/dracula-prism/dist/css/dracula-prism.css"
      ></link>
      <h2 className="text-2xl font-bold">
        Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ
      </h2>
      <article className="rounded-lg bg-white px-10 py-14 pt-4">
        {children}
      </article>
    </div>
  );
}
