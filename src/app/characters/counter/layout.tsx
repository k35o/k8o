import { Heading } from '@/components/heading';

export const metadata = {
  title: '文字数カウンター',
  description: '入力した文字数をカウントします',
  openGraph: {
    title: '文字数カウンター',
    description: '入力した文字数をカウントします',
    url: 'https://k8o.me/characters/counter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '文字数カウンター',
    card: 'summary',
    description: '入力した文字数をカウントします',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">文字数カウンター</Heading>
      {children}
    </div>
  );
}
