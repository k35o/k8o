import Link from 'next/link';
import { Heading } from '../_components/heading';

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
        <Heading type="h2">Characters</Heading>
      </Link>
      {children}
    </div>
  );
}
