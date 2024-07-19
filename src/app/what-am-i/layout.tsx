import { Heading } from '../../components/heading';

export const metadata = {
  title: 'What am I?',
  description: 'k8oの制作者の紹介します。',
  openGraph: {
    title: 'What am I?',
    description: 'k8oの制作者の紹介します。',
    url: 'https://k8o.me/what-am-i',
  },
  twitter: {
    title: 'What am I?',
    card: 'summary',
    description: 'k8oの制作者の紹介します。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Heading type="h2">What am I ?</Heading>
      {children}
    </div>
  );
}
