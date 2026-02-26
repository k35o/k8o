import { Heading } from '@k8o/arte-odyssey/heading';

export const metadata = {
  title: 'カラーコード職人',
  description: 'HEX・RGB・HSLの色表現を相互に変換します。',
  openGraph: {
    title: 'カラーコード職人',
    description: 'HEX・RGB・HSLの色表現を相互に変換します。',
    url: 'https://k8o.me/color-converter',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'カラーコード職人',
    card: 'summary',
    description: 'HEX・RGB・HSLの色表現を相互に変換します。',
  },
};

export default function Layout({ children }: LayoutProps<'/color-converter'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">カラーコード職人</Heading>
      {children}
    </div>
  );
}
