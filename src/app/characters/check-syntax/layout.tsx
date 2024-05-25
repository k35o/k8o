import { Heading } from '@/app/_components/heading';

export const metadata = {
  title: '日本語校正くん',
  description: 'テキストエリアに入力した文章の校正を行います。',
  openGraph: {
    title: '日本語校正くん',
    description: 'テキストエリアに入力した文章の校正を行います。',
    url: 'https://k8o.me/characters/check-syntax',
  },
  twitter: {
    title: '日本語校正くん',
    card: 'summary',
    description: 'テキストエリアに入力した文章の校正を行います。',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Heading type="h3">日本語校正くん</Heading>
      {children}
    </div>
  );
}
