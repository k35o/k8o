import Link from 'next/link';
import { Heading } from '../../components/heading';

export const metadata = {
  title: 'Quizzes',
  description: '色々なジャンルのクイズを出します。',
  openGraph: {
    title: 'Quizzes',
    description: '色々なジャンルのクイズを出します。',
    url: 'https://k8o.me/colors',
  },
  twitter: {
    title: 'Quizzes',
    card: 'summary',
    description: '色々なジャンルのクイズを出します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/quizzes">
        <Heading type="h2">Quizzes</Heading>
      </Link>
      {children}
    </div>
  );
}
