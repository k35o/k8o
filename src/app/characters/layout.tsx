import Link from 'next/link';

export const metadata = {
  title: 'Characters',
  description:
    '入力した文字の検索など、文字に対する操作を提供します。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/characters">
        <h2 className="text-2xl font-bold">Characters</h2>
      </Link>
      {children}
    </div>
  );
}
