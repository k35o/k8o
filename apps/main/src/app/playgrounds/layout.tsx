import type { Metadata } from 'next';
import { ContentContainer } from '@/app/_components/content-container';

export const metadata = {
  title: 'Playgrounds',
  description: 'ブログ記事や興味のある技術の試作品を集めています。',
  openGraph: {
    title: 'Playgrounds',
    description: 'ブログ記事や興味のある技術の試作品を集めています。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playgrounds',
    description: 'ブログ記事や興味のある技術の試作品を集めています。',
  },
} satisfies Metadata;

export default function PlaygroundsLayout({
  children,
}: LayoutProps<'/playgrounds'>) {
  return <ContentContainer>{children}</ContentContainer>;
}
