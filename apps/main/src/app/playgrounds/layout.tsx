import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playgrounds',
  description: 'ブログの記事や興味のある技術を試した試作品を集めた場所。',
  openGraph: {
    title: 'Playgrounds',
    description: 'ブログの記事や興味のある技術を試した試作品を集めた場所。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playgrounds',
    description: 'ブログの記事や興味のある技術を試した試作品を集めた場所。',
  },
};

export default function PlaygroundsLayout({
  children,
}: LayoutProps<'/playgrounds'>) {
  return children;
}
