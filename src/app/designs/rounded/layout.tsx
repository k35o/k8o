import { Heading } from '@/components/heading';

export const metadata = {
  title: 'かどまるラボ',
  description: '角丸を決めてお気に入りの図形を探しましょう',
  openGraph: {
    title: 'かどまるラボ',
    description: '角丸を決めてお気に入りの図形を探しましょう',
    url: 'https://k8o.me/designs/rounded',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'かどまるラボ',
    card: 'summary',
    description: '角丸を決めてお気に入りの図形を探しましょう',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h3">かどまるラボ</Heading>
      {children}
    </div>
  );
}
